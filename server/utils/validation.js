const validatePasswordServer = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
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
  return null;
};

const validateUsernameServer = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username) ? null : "Username must be 3-20 characters long and can only contain letters, numbers, underscores, and hyphens.";
};

const validateEmailServer = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : "Email is not valid.";
};



/**
 * Validates a name format.
 * @param {string} name - The name to validate.
 * @returns {boolean} - True if the name is valid >=3 and <=20, false otherwise.
 */
function validateNameServer(name) {
  return name.length >= 3 && name.length <= 20;
}


/**
 * Validates a username or email format.
 * @param {string} usernameOrEmail - The username or email to validate.
 * @returns {boolean} - True if the username or email is valid, false otherwise.
 */
function validateUsernameOrEmailServer(usernameOrEmail) {
    return usernameOrEmail.length >= 3;
}



export { validateUsernameOrEmailServer, 
  validateNameServer, 
  validatePasswordServer, 
  validateUsernameServer, 
  validateEmailServer };