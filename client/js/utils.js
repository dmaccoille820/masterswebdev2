/**
 * utils.js
 *
 * This file contains utility functions used throughout the application.
 */

/**
 * Displays a confirmation message.
 * @param {string} message - The confirmation message to display.
 */
function displayConfirmation(message) {
  console.log(message);
}

/**
 * Clears an error message from a specific element.
 * @param {HTMLElement} element - The HTML element containing the error message.
 */
function clearError(element) {
  if (element) {
    element.textContent = "";
    element.style.color = ""; 
    element.style.display = ""; 
  }
}

/**
 * Clears the input of a form element.
 * @param {HTMLInputElement} input - The input element to clear.
 */
function clearInput(input) {
  if (input) {
    input.value = "";
  }
}

/**
 * Displays an error message in a specific element.
 * @param {HTMLElement} element - The HTML element to display the error in.
 * @param {string} message - The error message to display.
 */
function displayError(element, message) {
  if (element) {
    element.textContent = message;
    element.style.color = "rgb(250, 234, 13)";
    element.style.display = "block";
  }
}

/**
 * Enables a button.
 * @param {HTMLButtonElement} button - The button to enable.
 */
function enableButton(button) {
  if (button) {
    button.disabled = false;
    button.style.opacity = "1";
  }
}

/**
 * Disables a button.
 * @param {HTMLButtonElement} button - The button to disable.
 */
function disableButton(button) {
  if (button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    


  }
}
function validatePasswordClient (password)  {
  if (password.length < 8|| password.length>20) {
    return "Password must be between 8-20 characters long.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }
  return true;
};
function validateEmailClient  (email)  {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)?$/;
  return emailRegex.test(email) ? true : "Email is not valid.";
};
 /**
* Validates a name format.
* @param {string} name - The name to validate.
* @returns {boolean} - True if the name is valid >=3 and <=20, false otherwise.
*/
function validateUsernameOrEmailClient(name) {
 return name.length >= 6 && name.length <= 20;
}
/**
 * Validates a name format.
 * @param {string} name - The name to validate.
 * @returns {boolean} - True if the name is valid >=3 and <=20, false otherwise.
 */
function validateNameClient(name) {
  return name.length >= 3 && name.length <= 20;
}
function validateUsernameClient  (username)  {
  const usernameRegex = /^[a-zA-Z0-9_-]{6,20}$/;
  return usernameRegex.test(username) ? true : "Username must be 6-20 characters long and can only contain letters, numbers, underscores, and hyphens.";
};
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
// Export all functions to make them available to other modules
export {
  displayConfirmation,
  clearError,
  clearInput,
  displayError,
  enableButton,
  disableButton,
  validatePasswordClient,
  validateUsernameOrEmailClient,
  validateEmailClient,
  validateNameClient,
  validateUsernameClient,
  getCookieValue
};
