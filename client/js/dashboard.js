"use strict";
const duration = 30000;
window.displayError = function (message, duration) {
  const errorDiv = document.createElement("div");
  errorDiv.id = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "10px";
  errorDiv.style.left = "50%";
  errorDiv.style.transform = "translateX(-50%)";
  errorDiv.style.backgroundColor = "purple";
  errorDiv.style.color = "orange";
  errorDiv.style.padding = "10px 20px";
  errorDiv.style.borderRadius = "5px";
  errorDiv.style.zIndex = "1000";
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    document.body.removeChild(errorDiv);
  }, duration);
};
function setUsernameInHeader() {
  const username = getCookie('user_name');
  if (username) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }
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
let progressChart = null;

setUsernameInHeader();

// Function to fetch and display projects
async function fetchAndDisplayProjects() {
  console.log("fetchAndDisplayProjects called");
  const sessionId = getCookieValue("sessionId");
  console.log("In dashboard.js getting sessionId ", sessionId);
  const userId = sessionStorage.getItem("userId");
  console.log("User ID from sessionStorage:", userId);
  if (!sessionId || !userId) {
    sessionStorage.clear;
    window.location.href = "/";
    return;
  }

  try {
    const response = await fetch("/api/dashboard/data", {
      method: "GET",
      headers: {
        sessionId: sessionId,
        user_id: userId,
        "Content-Type": "application/json",
      },
     
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.displayError("Unauthorized access. Redirecting to login.", 2000);
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 403) {
        window.displayError("Forbidden access. Redirecting to login.", 2000);
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 404) {
        window.displayError("Project not found. Redirecting to login.", 2000);
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 500) {
        window.displayError("Internal server error. Redirecting to login.", 2000);
        setTimeout(() => {
          window.location.href = "/";
      }, duration);
     } else {
        throw new Error("Network response was not ok");
      }
      return;
    }
    const projects = await response.json();
    displayProjects(projects);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    window.displayError("Failed to load projects. Please try again later.", 2000);
    setTimeout(() => {
      window.location.href = "/api/auth/login";
    }, duration);
  }
}

getCookieValue = function (name) {
  console.log("Cookie name:", name);
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");
  console.log("Cookie array:", cookieArray);
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
// Function to display projects in the UI
function displayProjects(projects) {
  const cardContainer = document.querySelector(".card-container");

  if (!projects || !Array.isArray(projects)) {
    console.error("displayProjects: Projects data is invalid or not an array.");
    window.displayError("No projects found.", 2000);
    return;
  }

  cardContainer.innerHTML = "";

  projects.forEach((project) => {
    console.log("Project data:", project);
    const {
      project_id,
      project_name = "Unnamed Project",
      project_description = "No description available",
      task_count = "N/A",
      project_status = "N/A",
      latest_due_date,
    } = project;
    console.log("Creating card for project_id:", project_id);
    
    const completion_percentage = task_count > 0
    ? project.tasks.filter(task => task.completion_status === 'Completed').length / task_count
    : 0;
    const card = document.createElement("div");
    card.classList.add("card");
    card.addEventListener("click", (function(project_id){
      return (event) => {
        console.log("Card clicked. Project ID:", project_id);
          const clickedElement = event.target;
          if (clickedElement.classList.contains("view-btn")) {
              window.location.href = `/tasks?project_id=${project_id}`;
              return;
          }
          window.location.href = `/tasks?project_id=${project_id}`;
          
      };
      })(project_id));
  
    

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = project_name;

    const taskDescription = document.createElement("p");
    taskDescription.textContent = project_description;

    const taskCount = document.createElement("p");
    taskCount.textContent = `Task Count: ${task_count}`;

    const taskCompletion = document.createElement("p");
    taskCompletion.textContent = `Task Completion: ${
      completion_percentage
        ? (completion_percentage * 100).toFixed(2) + "%"
        : "N/A"
    }`;
    const incompletion_percentage = 1 - completion_percentage;
    const taskIncompletion = document.createElement("p");
    taskIncompletion.textContent = `Task Incompletion: ${
      incompletion_percentage ? (incompletion_percentage* 100).toFixed(2) + "%" : "N/A"
    }`;
    const projectStatus = document.createElement("p");
    projectStatus.textContent = `Project Status: ${project_status}`;
    const dueDate = document.createElement("p");
    dueDate.textContent = `Due Date: ${
      latest_due_date ? new Date(latest_due_date).toLocaleDateString() : "N/A"
    }`;
    const viewButton = document.createElement("button");
    viewButton.classList.add("btn", "view-btn");
    viewButton.textContent = "Update Project";

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(taskDescription);
    cardContent.appendChild(taskCount);
    cardContent.appendChild(taskCompletion);
    cardContent.appendChild(taskIncompletion);
    cardContent.appendChild(projectStatus);
    cardContent.appendChild(dueDate);
    card.appendChild(cardContent);
    card.appendChild(viewButton);
    cardContainer.appendChild(card);
  
  
  }); 

  // create the chart, calculate the average first
  
  const totalCompletionPercentage = projects.reduce((sum, project) => {
    if(!project.tasks){
      console.error(`Project with ID ${project.project_id} has no tasks property.`);
      return sum;
    }
    const taskCompletionCount = project.tasks.filter(task => task.completion_status === 'Completed').length;
    return sum + (project.task_count > 0 ? taskCompletionCount / project.task_count : 0);
  }, 0);

  const averageCompletionPercentage = projects.length > 0 ? totalCompletionPercentage / projects.length : 0;
  createChart(averageCompletionPercentage, 1 - averageCompletionPercentage);
  if (projects.length > 0){
  }
  
}
function addCardClickListeners(projects) {
  
}

function setUsernameInHeader() {
  const username = getCookieValue("user_name");
  console.log("user_name from cookie", username);
  if (username) {
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = decodeURIComponent(username);
    }
  }
}

function createChart(averageCompletionPercentage, averageIncompletionPercentage) {
  const ctx = document.getElementById("progressChart").getContext("2d");
  if (progressChart) {
    progressChart.destroy();
    
  }
 progressChart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["Completed", "Incomplete"],
 
      datasets: [
        {
          label: "Task Completion",
          data: [averageCompletionPercentage * 100, averageIncompletionPercentage * 100],
          backgroundColor: [
            "#9933ff",
            "#ff66cc",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 20,
      },
      
      plugins: {
        legend: {
          labels: {
            color: "rgb(250, 234, 13)",
          },
        },
        title: {
          display: true,
          text: "Progress",
          color: "rgb(250, 234, 13)",
          font: {
            size: 18,
          },
        },
      },
      legend: {
        display: true,
        position: 'right',

      },
    },
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
          window.location.href = "/";
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
fetchAndDisplayProjects();
