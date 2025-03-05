// Globals
let cachedTasks = [];
let isTasksLoaded = false;

// DOM Elements
const createTaskForm = document.getElementById("newTaskForm");
const taskTableBody = document.getElementById("tasksTableBody");
const newTaskContainer = document.getElementById("newTaskContainer");
const tasksTableContainer = document.getElementById("tasksTableContainer");
const toggleCreateTask = document.getElementById("toggleCreateTask");
const newTaskBtn = document.getElementById("newTaskBtn");

const usersName = getCookieValue("user_name");
// Retrieve sessionId and userId from sessionStorage
const sessionId = sessionStorage.getItem("sessionId");
const userId = sessionStorage.getItem("userId");
const logoutBtn = document.getElementById("logoutBtn");

function setProjectId(project_id){
  sessionStorage.setItem("project_id", project_id);
}

async function loadTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const project_id = urlParams.get('project_id');
    console.log("loadTasks - project_id", project_id);
    console.log("loadTasks - sessionId", sessionId);
    console.log("loadTasks - userId", userId);
  try {
    setProjectId(project_id);
      if (project_id === null){
          console.log('No project to load.');
          return;
      }
    const tasks = await fetchTasks(sessionId, userId, project_id);
    displayTasks(tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}



// ... other functions (createTask, updateTask, deleteTask, etc.) ...
// Initialize the app and load tasks once the DOM is ready
$(document).ready(function () {
initializeApp();
loadTasks();
});
/**
 * Logs session and user information to the console.
 */
function logSessionAndUser() {
  console.log("Session ID:", sessionId);
  console.log("User ID:", userId);
  console.log("usersname", usersName);
}

/**
 * Sets the username in the DOM.
 */
function setUsername() {
  if (usersName) {
    const usernameElement = document.getElementById("usernameTasks");
    if (usernameElement) {
      usernameElement.textContent = usersName;
    }
  }
}

/**
 * Checks for a valid session ID and redirects if not found.
 */
function checkSession() {
  if (!sessionId) {
    console.log("redirecting because no sessionId in tasks.js");
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }
}

/**
 * Creates a new task.
 * @param {object} taskData - The task data to create.
 */
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
      await loadTasks(); // Reload tasks after successful creation
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

/**
 * Fetches tasks from the server.
 * @param {string} sessionId - The user's session ID.
 * @param {string} userId - The user's ID.
 * @param {string} project_id - The ID of the project to fetch tasks for.
 * @returns {Promise<Array>} - A promise that resolves to an array of tasks.
 * @throws {Error} - If the session ID or user ID is not found, or if the network response is not ok.
 */
async function fetchTasks(sessionId, userId, project_id) {
  if (!sessionId || !userId) {
    throw new Error("Session ID or User ID not found. Please log in.");
  }

  try {
    const url = `/api/tasks?project_id=${project_id}`;
    console.log("fetchTasks - url", url);
    console.log("fetchTasks - sessionId", sessionId);
    console.log("fetchTasks - userId", userId);
    const response = await fetch(url, {
      headers: {
        sessionId: sessionId,
        userId: userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}


/**
 * Displays tasks in the UI.
 * @param {Array} tasks - An array of tasks to display.
 */
function displayTasks(tasks) {
  // Clear the current table
  taskTableBody.innerHTML = "";

  // Ensure tasks is an array and has data
  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.warn("No tasks to display or invalid data format.");
    return;
  }

  tasks.forEach((task) => {
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

    // Edit/Delete
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
  });

  // Initialize DataTables after populating the table
  if ($.fn.DataTable.isDataTable("#tasksTable")) {
    $("#tasksTable").DataTable().destroy();
  }
  $("#tasksTable").DataTable({
    columnDefs: [
      {
        targets: [0], // task_id column
        visible: false,
        searchable: false,
      },
      {
        targets: [2], // task_description column
        visible: false,
        searchable: false,
      },
      {
        targets: [6], // Actions column
        orderable: false,
      },
    ],
  });
}


/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} taskData - The updated task data.
 */
async function updateTask(taskId, taskData) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (response.ok) {
      console.log(`Task ${taskId} updated successfully`);
      await loadTasks();
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 */
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
      await loadTasks();
    } else {
      console.error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

/**
 * Displays the update form for a given task.
 * @param {object} task - The task object to update.
 */
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

/**
 * Retrieves a cookie value by name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string} - The cookie value.
 * @throws {Error} - If the cookie is not found.
 */
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

// Event Listeners
logoutBtn.addEventListener("click", handleLogout);

// Initialize the app and load tasks once the DOM is ready
$(document).ready(function () {
  initializeApp();
  loadTasks();
});
