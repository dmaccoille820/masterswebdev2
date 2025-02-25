import {
  clearError,
  displayError,
  enableButton,
  disableButton,
  validatePasswordClient,
  validateUsernameOrEmailClient,
} from "./utils.js";

const loginForm = document.getElementById("loginForm");
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const loginNameError = document.getElementById("loginNameError");
const loginPasswordError = document.getElementById("loginPasswordError");
const loginButton = document.getElementById("btn1");
const loginAttempts = document.getElementById("loginAttempts");

let lockoutTimeout = null;
let timeoutId = null;
const lockoutLimit = 5;
const lockoutDuration = 4; // Lockout duration in seconds
let loginAttemptCount = 0;

document.addEventListener("DOMContentLoaded", function () {
  if (!loginForm) {
    console.error("Login form not found.");
    return;
  }

  loginUsernameInput.addEventListener("input", () => {
    clearError(loginNameError);
    loginNameError.style.color = "#ff66cc";
  });
  loginPasswordInput.addEventListener("input", () => {
    clearError(loginPasswordError);
    loginPasswordError.style.color = "#ff66cc";
  });

  // Add an event listener to the form to handle the submit event
  loginForm.addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    // Clear all errors
    clearError(loginNameError);
    clearError(loginPasswordError);

    // Check if locked out
    if (lockoutTimeout && new Date() < lockoutTimeout) {
      const timeLeft = Math.ceil((lockoutTimeout - new Date()) / 1000);
      displayError(
        loginAttempts,
        `Too many login attempts. Please try again in ${timeLeft} seconds.`
      );
      return;
    }

    // Get trimmed values
    const trimmedUsername = loginUsernameInput.value.trim();
    const trimmedPassword = loginPasswordInput.value.trim();

    // Client-side validation
    let isValid = true;

    if (!validateUsernameOrEmailClient(trimmedUsername)) {
      displayError(
        loginNameError,
        "Invalid username or email. Between 6 and 20 characters."
      );
      isValid = false;
    }
    if (validatePasswordClient(trimmedPassword) !== true) {
      displayError(
        loginPasswordError,
        validatePasswordClient(trimmedPassword)
      );
      isValid = false;
    }

    if (isValid) {
      console.log(
        "TrimmedUsername:",
        trimmedUsername,
        "TrimmedPassword:",
        trimmedPassword
      );
      // If validation passes, submit the form
      handleLoginSubmit(event);
    }
  });

  //enable login button:
  enableButton(loginButton);
});

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!loginForm) {
    console.error("Login form not found.");
    return;
  }

  if (lockoutTimeout && new Date() < lockoutTimeout) {
    const timeLeft = Math.ceil((lockoutTimeout - new Date()) / 1000);
    clearError(loginAttempts);
    displayError(
      loginAttempts,
      `Too many login attempts. Please try again in ${timeLeft} seconds.`
    );
    return;
  }

  try {
    const trimmedUsername = loginUsernameInput.value.trim();
    const trimmedPassword = loginPasswordInput.value.trim();
    console.log(
      "TrimmedUsername:",
      trimmedUsername,
      "TrimmedPassword:",
      trimmedPassword
    );

    const response = await fetch("/api/auth/login", {
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
      console.log("data from login.js", data);
      const username = data.username;
      console.log("username: ", username);
      const userId = data.user_id;
      console.log("userId from login.js", userId);
      sessionStorage.setItem("userId", userId);

      loginAttemptCount = 0;
      clearInterval(timeoutId); // Reset timeoutId
      timeoutId = null;
      enableButton(loginButton);
      console.log("Redirecting to /dashboard");

      window.location.href = "/dashboard.html";
    } else {
      loginAttemptCount++;

      if (loginAttemptCount >= lockoutLimit) {
        disableButton(loginButton);
        lockoutTimeout = new Date(
          new Date().getTime() + lockoutDuration * 1000
        );
        let countDown = lockoutDuration;

        displayError(
          loginAttempts,
          `Too many login attempts. Please try again in ${countDown} seconds.`
        );
               
        timeoutId = setInterval(() => {
          countDown--;
          if (countDown >= 0) {
            displayError(
              loginAttempts,
              `Too many login attempts. Please try again in ${countDown} seconds.`
            );
          } else {
            clearInterval(timeoutId);
            timeoutId=null;
          }
        }, 1000);
        setTimeout(() => {
          loginAttemptCount = 0;
          lockoutTimeout = null;
          enableButton(loginButton);
          clearError(loginAttempts);
          if (timeoutId){
            clearInterval(timeoutId);
            timeoutId = null;
          }
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
 // clearInput(loginUsernameInput);
 // clearInput(loginPasswordInput);
}
