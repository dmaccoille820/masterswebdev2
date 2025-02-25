import {
  clearError,
  clearInput,
  displayError,
  enableButton,
  validateUsernameClient,
  validateEmailClient,
  validatePasswordClient,
  validateNameClient
} from "./utils.js";
  
  /////////////////////////
  //// Check box logic ////
  /////////////////////////
  
  const loginPage = document.querySelector(".page.login-page");
  const registerPage = document.querySelector(".page.register-page");
  
  const checkbox = document.getElementById("check");
  if (checkbox.checked) {
    loginPage.style.display = "none";
    registerPage.style.display = "block";
  } else {
    loginPage.style.display = "block";
    registerPage.style.display = "none";
  }
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      loginPage.style.display = "none";
      registerPage.style.display = "block";
    } else {
      loginPage.style.display = "block";
      registerPage.style.display = "none";
    }
  });
  
  ////////////////////////
  //// Register Logic ////
  ////////////////////////

const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("registerName");
const usernameInput = document.getElementById("registerUsername");
const emailInput = document.getElementById("registerEmail");
const passwordInput = document.getElementById("registerPassword");
const confirmPasswordInput = document.getElementById("registerConfirmPassword");
const nameError = document.getElementById("nameError");
const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const registerButton = document.getElementById("btn2");
const registrationSuccessMessage = document.getElementById("registrationSuccessMessage");

// Check if all elements exist
if (
  registerForm &&
  nameInput &&
  usernameInput &&
  emailInput &&
  passwordInput &&
  confirmPasswordInput &&
  nameError &&
  usernameError &&
  emailError &&
  passwordError &&
  confirmPasswordError &&
  registerButton &&
  registrationSuccessMessage
) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Clear any previous errors
    clearError(nameError);
    clearError(usernameError);
    clearError(emailError);
    clearError(passwordError);
    clearError(confirmPasswordError);

    // Get trimmed values
    const trimmedName = nameInput.value.trim();
    const trimmedUsername = usernameInput.value.trim();
    const trimmedEmail = emailInput.value.trim();
    const trimmedPassword = passwordInput.value.trim();
    const trimmedConfirmPassword = confirmPasswordInput.value.trim();
    let isValid = true;

    if (!validateNameClient(trimmedName)) {
      displayError(nameError, "Invalid name format.");
      isValid = false;
    }

    if (validateUsernameClient(trimmedUsername)!=true) {
      displayError(usernameError, validateUsernameClient(trimmedUsername));
      isValid = false;
    }

    if (!validateEmailClient(trimmedEmail)) {
      displayError(emailError, "Invalid email format.");
      isValid = false;
    }

    if (validatePasswordClient(trimmedPassword)!=true) {
      displayError(
        passwordError, validatePasswordClient(trimmedPassword)
      );
      isValid = false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      displayError(confirmPasswordError, "Passwords do not match.");
      isValid = false;
    }

    if (isValid) {
      // Perform the registration action (e.g., sending data to server)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const errorData = await response.json();

      if (!response.ok) {
        const error = errorData.message || "An error occurred during registration.";
        console.error(error);
        displayError(nameError, error);
        return { error };
      }

      // Registration Success

      registrationSuccessMessage.innerText =
        "Registration successful. Redirecting in 3";
      registrationSuccessMessage.style.color = "green";

      clearInput(passwordInput);
      clearInput(confirmPasswordInput);
      clearInput(usernameInput);
      clearInput(emailInput);
      clearInput(nameInput);

      clearError(nameError);
      clearError(usernameError);
      clearError(emailError);
      clearError(passwordError);
      clearError(confirmPasswordError);
      disableButton(registerButton);
      registrationSuccessMessage.style.display = "block";
    } else {
      console.log("Validation failed. Form not submitted. Error: "+ error);
      confirmPasswordError.textContent=error;

    }
  });
} else {
  console.error("One or more required elements for registration are missing.");
}

// Enable the button
enableButton(registerButton);
  