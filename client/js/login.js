import {
  clearError,
  clearInput,
  displayError,
  enableButton,
  disableButton,
  validatePasswordClient,
  validateUsernameOrEmailClient,
} from "./utils.js";
const loginForm = document.getElementById("loginForm");
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const loginNameError = document.getElementById("labelline");
const loginPasswordError = document.getElementById("loginPasswordError");
const loginButton = document.getElementById("btn1");
const lockoutDuration = 30000;
let lockoutTimeout = null;

document.addEventListener("DOMContentLoaded", function () {
  // add on click of and input field to remove the error message
  loginUsernameInput.addEventListener("input", () => {
    clearError(loginNameError);
  });
  loginPasswordInput.addEventListener("input", () => {
    clearError(loginPasswordError);
  });
  // Add an event listener to the form to handle the submit event
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      // Prevent the default form submission behavior
      event.preventDefault();
      clearError(loginNameError);
      clearError(loginPasswordError);

      // Check if locked out
      if (lockoutTimeout && new Date() < lockoutTimeout) {
        const timeLeft = Math.ceil((lockoutTimeout - new Date()) / 1000);
        displayError(
          loginNameError,
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
        displayError(loginNameError, "Invalid username/email format.");
        isValid = false;
      }
      if (!validatePasswordClient(trimmedPassword)) {
        displayError(
          loginPasswordError,
          "Invalid password format. Needs to be at least 8 characters, have an uppercase, lowercase, number, and special character"
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
        // If validation passes, submit the form programmatically
        loginForm.submit();
      } else {
        // If validation fails, do not submit the form
        console.log("Validation failed. Form not submitted.");
      }
    });
  }
  //enable login button:
  enableButton(loginButton);
});
async function handleLoginSubmit(event) {
  event.preventDefault();

  const loginForm = document.getElementById("loginForm");
  const loginUsernameInput = document.getElementById("loginUsername");
  const loginPasswordInput = document.getElementById("loginPassword");
  const loginNameError = document.getElementById("loginNameError");
  const loginPasswordError = document.getElementById("loginPasswordError");
  const loginButton = document.getElementById("btn1");
  let lockoutLimit = 5;
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
  // Client validate username and password fields lenths between 3 and 20 characters
  if (
    loginUsernameInput.value.trim.length < 3 ||
    loginUsernameInput.value.trim.length > 20
  ) {
    displayError(loginNameError, "Username is required.");
    return;
  }
  if (
    loginUsernameInput.value.trim.length < 3 ||
    loginUsernameInput.value.trim.length > 20
  ) {
    displayError(loginPasswordError, "Password is required.");
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
      timeoutId = null; // Reset timeoutId
      clearTimeout(timeoutId);
      enableButton(loginButton);
      console.log("Redirecting to /dashboard");

      window.location.href = "/dashboard.html";
    } else {
      loginAttemptCount++;

      if (loginAttemptCount >= lockoutLimit) {
        const lockoutDuration = 4; // 4 seconds
        lockoutTimeout = new Date(
          new Date().getTime() + lockoutDuration * 1000
        );
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
          enableButton(loginButton);
          clearInput(loginNameError);
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

let loginAttemptCount = 0;

let timeoutId = null;

if (!loginForm) {
  console.error("Login form not found.");
} else {
  validateUsernameOrEmailClient(loginUsernameInput);
  validatePasswordClient(loginPasswordInput),
    loginForm.addEventListener("submit", handleLoginSubmit);
}
