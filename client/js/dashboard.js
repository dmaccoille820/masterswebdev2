const duration=30000
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


  fetchAndDisplayProjects();
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
    const response = await fetch("/api/dashboard/projects", {
      method: "POST",
      headers: {
        sessionId: sessionId,
        userId: userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.displayError("Unauthorized access. Redirecting to login.");
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 403) {
        window.displayError("Forbidden access. Redirecting to login.");
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 404) {
        window.displayError("Project not found. Redirecting to login.");
        setTimeout(() => {
          window.location.href = "/";
        }, duration);
      } else if (response.status === 500) {
        window.displayError("Internal server error. Redirecting to login.");
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
    addCardClickListeners(projects);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    window.displayError("Failed to load projects. Please try again later.");
    setTimeout(() => {
      window.location.href = "/api/tasks";
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
    window.displayError("No projects found.");
    return;
  }

  cardContainer.innerHTML = "";

  projects.forEach((project) => {
    const {
      project_id,
      project_name = "Unnamed Project",
      project_description = "No description available",
      task_count = "N/A",
      completion_percentage,
      project_status = "N/A",
      latest_due_date,
    } = project;

    const card = document.createElement("div");
    card.classList.add("card");

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
      incompletion_percentage ? incompletion_percentage + "%" : "N/A"
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
    viewButton.addEventListener('click', () => {
      window.location.href = `/project/${project_id}`;
    });

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(taskDescription);
    cardContent.appendChild(taskCount);
    cardContent.appendChild(taskCompletion);
    cardContent.appendChild(projectStatus);
    cardContent.appendChild(dueDate);
    card.appendChild(cardContent);
    card.appendChild(viewButton);
    cardContainer.appendChild(card);
  
  
  });
  // create the chart
  if (projects.length > 0){
    createChart(projects[0].completion_percentage, 1 - projects[0].completion_percentage);
  }
}
function addCardClickListeners(projects) {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    const projectId = projects[index].project_id;
    card.addEventListener(
      "click",
      () => (window.location.href = `/project/${projectId}`)
    );
  });
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

function createChart(completion_percentage, incompletion_percentage) {
  const ctx = document.getElementById("progressChart").getContext("2d");
  if (progressChart) {
    progressChart.destroy();
  }
  new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["Completed", "Incomplete"],

      datasets: [
        {
          label: "Task Completion",
          data: [completion_percentage*100, incompletion_percentage*100],
          backgroundColor: [
            "#9933ff",
            "#ff66cc",
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
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
