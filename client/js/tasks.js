const createTaskForm = document.getElementById("createTaskForm");
const taskTableBody = document.getElementById("taskTableBody");
const taskTable = $('#taskTable');
let isTasksLoaded = false;
let cachedTasks = [];

const tableContainer = document.getElementById('taskTableContainer');
const usersName = getCookieValue("user_name");

const sessionId = getCookie("sessionId");
const userId = sessionStorage.getItem("userId");
console.log("Session ID:", sessionId);
console.log("User ID:", userId);
console.log("usersname",usersName);

    if (usersName) {
      const usernameElement = document.getElementById("username");
      if (usernameElement) {
        usernameElement.textContent = usersName;
      }
    }
  

// Check for a valid sessionId before proceeding
if (!sessionId) {
  console.log("redirecting because no sessionId in tasks.js")
    // Redirect to the login page or display an error
   
    setTimeout(() => {
        window.location.href = "/"; 
    }, 2000); 
   
}


async function createTask(taskData) {
    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData)
        });
        if (response.ok) {
            const data = await response.json();
            loadTasks();// Reload tasks after successful creation
        }
        else {
            const data = await response.json();
        }
    } catch (error) {
        console.error("Error creating task:", error);
    }
}

async function fetchTasks() {
    if (!sessionId || !userId) {
        throw new Error("Session ID or User ID not found. Please log in.");
    }
    try {
        const response = await fetch("/api/tasks", {
            headers: {
                sessionId: sessionId,
                userId: userId
            }
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok ${response.status}`);
        }
        const tasks = await response.json();
        if (tasks.length === 0) {
            
        }
        else {
            //displayTasks(tasks);
        }
        return tasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
}

async function updateTask(taskId, taskData) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData),
        });
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

async function deleteTask(taskId) {
    try {
        // Fetch task details to check the status
        const taskResponse = await fetch(`/api/tasks/${taskId}`);
        const task = await taskResponse.json();
        // Check if the task status is 'completed'
        if (task.completion_status.toLowerCase() !== 'completed') {
            alert('Task can only be deleted if the status is "Completed".');
            return;
        }
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            displayTasks(await fetchTasks());
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
    
    // Create and append input fields
    const inputFields = [
        { name: "taskId", value: task.taskId, type: "hidden" },
        { name: "taskName", value: task.taskName, label: "Task Name" },
        { name: "taskDescription", value: task.taskDescription, label: "Task Description" },
        { name: "taskDueDate", value: task.taskDueDate, label: "Due Date", type: "date" },
        { name: "taskPriority", value: task.taskPriority, label: "Priority" },
        { name: "taskStatus", value: task.taskStatus, label: "Status" },
    ];

    inputFields.forEach(field => {
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
    submitButton.className = 'update-submit';
    updateForm.appendChild(submitButton);

    updateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const taskData = Object.fromEntries(new FormData(updateForm));
        updateTask(task.task_id, taskData);
    });
    taskElement.appendChild(updateForm);
}

 function getCookieValue (name) {
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
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    console.error(`No ${name} found in cookies.`);
    throw new Error(`No ${name} found in cookies`);
  };

// Add event listener to the form
createTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectId = 1; //hardcoded for testing purposes
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
    });
});



async function loadTasks() {
    if (isTasksLoaded) {
        console.log("Tasks already loaded, using cached tasks.");
        return; 
    }
    try {
        cachedTasks = await fetchTasks();
        taskTable.DataTable({
            data: cachedTasks,
            columns: [
                { data: 'task_id', title: 'Task ID',
                  visible: false
                 },

                { data: 'task_name', title: 'Task Name' },
                { data: 'task_description', title: 'Description' },
                {
                    data: 'due_date',
                    title: 'Due Date',
                    render: function (data) {
                        return new Date(data).toLocaleDateString('en-US');
                    }
                },
                { data: 'priority', title: 'Priority' },
                { data: 'completion_status', title: 'Status' },
            ],
            dom: 'Bfrtip',
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print'],
            order: [[0, 'desc']]
        });
        isTasksLoaded = true;
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

function displayTasks(tasks) {
    taskTableBody.innerHTML = '';
        const row = document.createElement("tr");

    const cellKeys = [ 'taskId','task_name', 'task_description', 'due_date', 'priority'];
        cellKeys.forEach(key => {
            const cell = document.createElement("td");
            

        const statusCell = document.createElement("td");
        statusCell.textContent = task.completion_status;
        if (task.completion_status.toLowerCase() === 'completed') {
            statusCell.classList.add('status-completed');
        } else if (task.completion_status.toLowerCase() === 'in progress') {
            statusCell.classList.add('status-in-progress');
        } else if (task.completion_status.toLowerCase() === 'pending') {
            statusCell.classList.add('status-pending');
        }


        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.className = "update-btn";
        updateButton.addEventListener("click", () => {
            displayUpdateForm(task);
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => {
            deleteTask(task.task_id);
        });
        actionsCell.appendChild(updateButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        taskTableBody.appendChild(row);
    })
};

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

//Logout function
document.getElementById("logoutBtn").addEventListener("click", handleLogout);

// Load tasks
loadTasks();

