
const createTaskForm = document.getElementById("newTaskForm");
const taskTableBody = document.getElementById("tasksTableBody");
const newTaskContainer = document.getElementById("newTaskContainer");
const tasksTableContainer = document.getElementById("tasksTableContainer");
const toggleCreateTask = document.getElementById("toggleCreateTask");
const newTaskBtn = document.getElementById("newTaskBtn");

const usersName = getCookieValue("user_name");
const sessionId = sessionStorage.getItem("sessionId");
const logoutBtn = document.getElementById("logoutBtn");

function setProjectId(project_id){
  sessionStorage.setItem("project_id", project_id);  
}

async function loadTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const project_id = urlParams.get('project_id');
    console.log("loadTasks - project_id", project_id);
    console.log("loadTasks - sessionId", sessionId);
  try {
    setProjectId(project_id);
      if (project_id === null){
          console.log('No project to load.');
          return;
      }
    const tasks = await fetchTasks(sessionId, project_id);
    console.log("loadTasks - tasks:", tasks);
    displayTasks(tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}
function logSessionAndUser() {
  console.log("Session ID:", sessionId, "usersname", usersName);
}

function setUsername() {
  if (usersName) {
    const usernameElement = document.getElementById("usernameTasks");
    if (usernameElement) {
      usernameElement.textContent = usersName;
    }
  }
}

function checkSession() {
  if (!sessionId) {
    console.log("redirecting because no sessionId in tasks.js");
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }
}

  async function createTask(taskData) {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        console.log("Task created successfully");
        const createdTask = await response.json();
        await addTaskToTable(createdTask); 
        toggleCreateTask.checked = false;
        newTaskContainer.style.display = "none";
        tasksTableContainer.style.display = "block";
      } else {
        const data = await response.json();
        console.error("Error creating task:", data);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  async function fetchTasks(sessionId, project_id) { 
    if (!sessionId) { 
      throw new Error("Session ID not found. Please log in.");
    }

    try {
      const url = `/api/tasks?project_id=${project_id}`;
      console.log("fetchTasks - url", url);
      console.log("fetchTasks - sessionId", sessionId);
      const response = await fetch(url, {
        headers: {
          sessionid: sessionId, project_id: project_id, 
        },
      });
      console.log("fetchTasks - response:", response);
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  function displayTasks(tasks) {
    console.log("displayTasks - Start", tasks);
    taskTableBody.innerHTML = "";
    if (!Array.isArray(tasks)) {
      tasks = [tasks]
    }
    console.log("displayTasks - Middle", tasks);
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.warn("No tasks to display or invalid data format.");
     // return;
    }
    tasks.forEach((task) => {
        addTaskToTable(task); 
    });
  console.log("displayTasks - Before DataTable initialization");
  if ($.fn.DataTable.isDataTable("#tasksTable")) {
    console.log("displayTasks - DataTable exists, destroying it");
    $("#tasksTable").DataTable().destroy();
  }
  console.log("displayTasks - Initializing DataTable");
  $("#tasksTable").DataTable({
    columnDefs: [
      {targets: [0], visible: false,searchable: false,},
      {targets: [2], visible: false, searchable: false,},
      {targets: [6],  orderable: false,},
    ],
  });
}

async function addTaskToTable(task){ 
    console.log("addTaskToTable - adding task:", task);
    const dueDate = new Date(task.due_date);
    const formattedDueDate = dueDate.toLocaleDateString();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="display:none;">${task.task_id}</td>
      <td><b>${task.task_name}</b></td>
      <td>${task.task_description}</td>
      <td>${formattedDueDate}</td>
      <td>${task.priority}</td>
      <td>${task.completion_status}</td>
    `;
  
    const actionsCell = document.createElement("td");
  
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-btn";
    editButton.addEventListener("click", () => displayUpdateForm(task));
  
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => deleteTask(task.task_id));
  
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);
    taskTableBody.appendChild(row);
    console.log("addTaskToTable - task added");
}

async function updateTask(taskId, taskData) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (response.ok) {
      console.log(`Task ${taskId} updated successfully`);
      taskTableBody.innerHTML = "";
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function deleteTask(taskId) {
  try {
    const taskResponse = await fetch(`/api/tasks/${taskId}`);
    const task = await taskResponse.json();
    if (task.completion_status.toLowerCase() !== "completed") {
      alert('Task can only be deleted if the status is "Completed".');
      return;
    }
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      
      taskTableBody.innerHTML = "";
      await loadTasks();//added
    } else {
      console.error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}


function displayUpdateForm(task) {
  const taskElement = document.getElementById(`task-${task.taskId}`);
  const updateForm = document.createElement("form");
  updateForm.className = "update-form";
  updateForm.id = `update-form-${task.taskId}`;

  const inputFields = [
    { name: "taskId", value: task.taskId, type: "hidden" },
    { name: "taskName", value: task.taskName, label: "Task Name" },
    {
      name: "taskDescription",
      value: task.taskDescription,
      label: "Task Description",
    },
    {
      name: "taskDueDate",
      value: task.taskDueDate,
      label: "Due Date",
      type: "date",
    },
    { name: "taskPriority", value: task.taskPriority, label: "Priority" },
    { name: "taskStatus", value: task.taskStatus, label: "Status" },
  ];

  inputFields.forEach((field) => {
    const input = document.createElement("input");
    input.type = field.type || "text";
    input.name = field.name;
    input.value = field.value;
    input.placeholder = field.label;
    updateForm.appendChild(input);
  });

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Update Task";
  submitButton.className = "update-submit";
  updateForm.appendChild(submitButton);

  updateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const taskData = Object.fromEntries(new FormData(updateForm));
    updateTask(task.task_id, taskData);
  });
  taskElement.appendChild(updateForm);
}


function getCookieValue(name) {
  console.log("Cookie name:", name);
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1); 
    }
    if (cookie.indexOf(cookieName) === 0) {
      const CookieValue = cookie.substring(cookieName.length, cookie.length);
      console.log("Cookie value:", CookieValue);
      return CookieValue;
    }
  }
  console.error(`No ${name} found in cookies.`);
  throw new Error(`No ${name} found in cookies`);
}

/**
 * Handles the logout process.
 */
async function handleLogout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      window.location.href = "/"; // Redirect to login page
    } else {
      const errorData = await response.json();
      console.error("Logout failed:", errorData.message);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Initializes the new task form.
 */
function initializeNewTaskForm() {
  if (createTaskForm) {
    createTaskForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);
      const project_id = urlParams.get('project_id');
      const taskName = document.getElementById("taskName").value;
      const taskDescription = document.getElementById("taskDescription").value;
      const taskDueDate = document.getElementById("taskDueDate").value;  
      const taskPriority = document.getElementById("taskPriority").value;
      const taskStatus = document.getElementById("taskStatus").value;

      await createTask({
        projectId,
        taskName,
        taskDescription,
        taskDueDate,
        taskPriority,
        taskStatus,
        project_id
      });
    });
  }
}

/**
 * Initializes the application.
 */
function initializeApp() {
  logSessionAndUser();
  setUsername();
  checkSession();
  initializeNewTaskForm();
  // Add event listener for the checkbox
  toggleCreateTask.addEventListener("change", function () {
    if (this.checked) {
      newTaskContainer.style.display = "block";
      tasksTableContainer.style.display = "none";
    } else {
      newTaskContainer.style.display = "none";
      tasksTableContainer.style.display = "block";
    }
  });
  newTaskBtn.addEventListener("click", function (e) {
    e.preventDefault();
    toggleCreateTask.click();
  });
}
$(document).ready(function () { 
  initializeApp();
  loadTasks();
  });
// Event Listeners
logoutBtn.addEventListener("click", handleLogout); 
