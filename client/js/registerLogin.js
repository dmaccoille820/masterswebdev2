
////////////////////////
////  Login Logic  /////
////////////////////////


document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginUsernameInput = document.getElementById("loginUsername");
  const loginPasswordInput = document.getElementById("loginPassword");
  const loginNameError = document.getElementById("loginNameError");
  const loginPasswordError = document.getElementById("loginPasswordError");
  const loginAttempts = document.getElementById("loginAttempts");
  const loginButton = document.getElementById("btn1"); 
 

  enableLoginButton(loginButton);

  // Clear errors on focus for login fields
  loginUsernameInput.addEventListener("focus", () => clearError(loginNameError));
  loginPasswordInput.addEventListener("focus", () => clearError(loginNameError));
  loginUsernameInput.addEventListener("focus", () => clearError(loginPasswordError));
  loginPasswordInput.addEventListener("focus", () => clearError(loginPasswordError));
  loginUsernameInput.addEventListener("focus", () => clearError(loginAttempts));
  loginPasswordInput.addEventListener("focus", () => clearError(loginAttempts));

  // Handle the login submission
  loginForm.addEventListener("submit", handleLoginSubmit);
});

function setUsernameInHeader() {
  const username = localStorage.getItem('username');
  if (username) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }
}

setUsernameInHeader();
let loginAttemptCount = 0;
let lockoutTimeout = null;
let timeoutId = null;
const lockoutLimit = 3; // Define your lockout limit here

async function handleLoginSubmit(event) {
  event.preventDefault();

  const loginForm = document.getElementById('loginForm');
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginNameError = document.getElementById("loginNameError");
  const loginButton = document.getElementById("btn1");

  if (!loginForm) {
      console.error("Login form not found.");
      return;
  }

  if (lockoutTimeout && new Date() < lockoutTimeout) {
    const timeLeft = Math.ceil((lockoutTimeout - new Date()) / 1000);
    displayError(
      loginNameError,
      `Too many login attempts. Please try again in ${timeLeft} seconds.`
    );
    return;
  }

  try {
    const trimmedUsername = loginUsernameInput.value.trim();
    const trimmedPassword = loginPasswordInput.value.trim();
    console.log("Username:", trimmedUsername, "Password:", trimmedPassword);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernameOrEmail: trimmedUsername,
        password: trimmedPassword,
      }),
    });

    if (response.ok) {
      console.log("Login success");
      const data = await response.json();
      const username = data.username;
      const userId = data.user_id;
      console.log("userId from login", userId);
      sessionStorage.setItem('username', username);
      setUsernameInHeader();
      
      loginAttemptCount = 0;
      timeoutId = null; // Reset timeoutId
      clearTimeout(timeoutId);
      enableLoginButton(loginButton);
      console.log("Redirecting to /dashboard");
      
      window.location.href = "/dashboard";
    } else {
      loginAttemptCount++;

      if (loginAttemptCount >= lockoutLimit) {
        const lockoutDuration = 4; // 4 seconds
        lockoutTimeout = new Date(new Date().getTime() + lockoutDuration * 1000);
        let countDown = lockoutDuration;
        displayError(
          loginNameError,
          `Too many login attempts. Please try again in ${countDown} seconds.`
        );
        disableButton(loginButton);
        timeoutId = setInterval(() => {
          countDown--;
          if (countDown >= 0) {
            displayError(
              loginNameError,
              `Too many login attempts. Please try again in ${countDown} seconds.`
            );
          }
        }, 1000);
        setTimeout(() => {
          loginAttemptCount = 0;
          lockoutTimeout = null;
          enableLoginButton(loginButton);
          clearError(loginNameError);
        }, lockoutDuration * 1000);
      } else {
        const errorData = await response.json();
        displayError(
          loginNameError,
          errorData.message || "Invalid username/email or password."
        );
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    
    displayError(loginNameError, "An error occurred during login.");
  }
}

function disableButton(button) {
  button.disabled = true;
  button.style.cursor = "not-allowed";
}

function enableLoginButton(button) {
  button.disabled = false;
  button.style.cursor = "pointer";
}
