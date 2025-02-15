const createTaskForm = document.getElementById("createTaskForm");
const taskTableBody = document.getElementById("taskTableBody");
const userName = document.getElementById("userName");

const sessionId = getCookie("sessionId");
const userId = sessionStorage.getItem("userId");
console.log("Session ID:", sessionId);
console.log("User ID:", userId);
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
            taskTableBody.innerHTML = '<p>There are no tasks.</p>';
        } else {
            displayTasks(tasks);
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
    updateForm.id = `update-form-${task.taskId}`; // Unique ID for each form
    // Create and append input fields
    const inputFields = [
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
async function fetchUserData() {
    const sessionId = getCookie("sessionId");
    try {
        const response = await fetch("/api/user-data", {
            headers: {
                sessionId: sessionId,
            }
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        try {
            const data = await response.json();
            userName.textContent = data.name;
            // Now we have more data
            console.log("User data:", data);
        } catch (parseError) {
            console.error("Error parsing user data:", parseError);
        }
    } catch (error) {
        console.error("Error getting user data", error);
    }
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length > 1) {
        return parts.pop().split(';').shift();
    }
    return null;
}

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

function addTaskRow(task) {
    const row = document.createElement("tr");
    row.id = `task-${task.taskId}`;

    const taskIdCell = document.createElement("td");
    taskIdCell.textContent = task.task_id;
    row.appendChild(taskIdCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = task.task_name;
    row.appendChild(nameCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = task.task_description;
    row.appendChild(descriptionCell);

    const dueDateCell = document.createElement("td");
    dueDateCell.textContent = task.due_date;
    row.appendChild(dueDateCell);

    const priorityCell = document.createElement("td");
    priorityCell.textContent = task.priority;
    row.appendChild(priorityCell);

    const statusCell = document.createElement("td");
    statusCell.textContent = task.completion_status;
    row.appendChild(statusCell);

    const actionsCell = document.createElement("td");
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.className = "update-btn";
    updateButton.id = `update-${task.taskId}`;
    updateButton.addEventListener("click", () => {
        displayUpdateForm(task);
    });
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.id = `delete-${task.taskId}`;
    deleteButton.addEventListener("click", () => {
        deleteTask(task.task_id);
    });
    actionsCell.appendChild(updateButton);
    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    taskTableBody.appendChild(row);
}

async function loadTasks() {
    taskTableBody.innerHTML = ""; // Clear previous tasks
    const tasks = await fetchTasks();
    tasks.forEach(addTaskRow);
}
function displayTasks(tasks) {
    taskTableBody.innerHTML = '';
    tasks.forEach(task => {
        const row = document.createElement("tr");
        row.id = `task-${task.taskId}`;

        const cellKeys = ['task_id', 'task_name', 'task_description', 'due_date', 'priority'];
        cellKeys.forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = task[key];
            row.appendChild(cell);
        });

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
    });
}

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

//Fetch user data
fetchUserData();
// Load tasks
loadTasks();
