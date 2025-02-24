import * as registerModel from "../../models/registerModel.js";
import * as utils from "../../utils/validation.js";



 async function handleRegistrationSubmit(form, elements) {
    const {
        nameInput,
        usernameInput,
        emailInput,
        passwordInput,
        confirmPasswordInput,
        nameError,
        usernameError,
        emailError,
        passwordError,
        confirmPasswordError,
        registrationMessage
    } = elements;

    console.log("handleRegistrationSubmit - form elements values",
        {
            name: nameInput.value,
            username: usernameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value
        }
    );

    const passwordErrorText = utils.validatePasswordClient(passwordInput.value);
    const usernameErrorText = utils.validateUsernameClient(usernameInput.value);
    const emailErrorText = utils.validateEmailClient(emailInput.value) ? null : !utils.validateEmailClient(emailInput.value) ? "Email is not valid." : null;
    const nameErrorText = utils.validateNameClient(nameInput.value);
    console.log("handleRegistrationSubmit - error strings",
        {
            passwordError: passwordErrorText,
            usernameError: usernameErrorText,
            emailError: emailErrorText,
            nameError: nameErrorText
        }
    );

    // Early exit if there are any errors
    if (usernameErrorText) {
        utils.displayError(usernameError, usernameErrorText);
        return { error: usernameErrorText };
    }
    if (nameErrorText) {
        utils.displayError(nameError, nameErrorText);
        return { error: nameErrorText };
    }
    if (emailErrorText) {
        utils.displayError(emailError, emailErrorText);
        return { error: emailErrorText };
    }
    if (passwordErrorText) {
        utils.displayError(passwordError, passwordErrorText);
        return { error: passwordErrorText };
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
        utils.displayError(confirmPasswordError, "Passwords do not match.");
        return { error: "Passwords do not match." };
    }
    const requestBody = JSON.stringify({ username: usernameInput.value, email: emailInput.value });
    console.log("checkUsernameAvailability - Sending request to /check-username with body:", requestBody);
  
    const response = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
    });
    const data = await response.json();
    console.log("handleRegistrationSubmit - checkUsernameAvailability response:", response);
    if (!response.ok) {
        if (response.status === 409 && data.message) {
            if (data.code === "USERNAME_TAKEN") {
                utils.displayError(usernameError, data.message);
                return { error: "Username taken." };
            } else if (data.code === "EMAIL_TAKEN") {
                utils.displayError(emailError, data.message);
                return { error: "Email taken." };
            }
            console.log("checkUsernameAvailability - Returning false due to taken username or email.");
        } else {
            utils.displayError(
                usernameError,
                "An error occurred during the check. Please try again."
            );
            console.log("checkUsernameAvailability - Returning false due to error during check.");
            return { error: "An error occurred during the check. Please try again." };
        }
    }
    console.log("handleRegistrationSubmit - about to call /api/register");
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nameInput.value,
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.errors) {
                if (errorData.errors.email) {
                    utils.displayError(emailError, errorData.errors.email);
                    return { error: errorData.errors.email };
                } else if (errorData.errors.confirmPassword) {
                    utils.displayError(confirmPasswordError, errorData.errors.confirmPassword);
                    return { error: errorData.errors.confirmPassword };
                } else {
                    utils.displayError(usernameError, "An error occured during registration.");
                    return { error: "An error occured during registration." };
                }
            }
            return { error: "An error occured during registration." };
        }
        return true;
    } catch (error) {
        console.error("Registration error:", error);
        utils.displayError(
            usernameError,
            "An error occured during registration. Username or email taken"
        );
        return { error: "An error occured during registration. Username or email taken" };
    }
}

 function setConstants(constants) {
    registerForm = constants.registerForm;
    nameInput = constants.nameInput;
    usernameInput = constants.usernameInput;
    emailInput = constants.emailInput;
    passwordInput = constants.passwordInput;
    confirmPasswordInput = constants.confirmPasswordInput;
    nameError = constants.nameError;
    usernameError = constants.usernameError;
    emailError = constants.emailError;
    passwordError = constants.passwordError;
    confirmPasswordError = constants.confirmPasswordError;
    registrationMessage = constants.registrationMessage;
}
const handleAvailabilityResponse = (res, isAvailable) => {
  switch (isAvailable) {
    case 1:
      return res.status(200).json({ available: true });
    case -1:
      return res.status(409).json({ message: "Username taken.", code: "USERNAME_TAKEN" });
    case -2:
      return res.status(409).json({ message: "Email taken.", code: "EMAIL_TAKEN" });
    default:
      return res.status(500).json({ error: "Internal server error in registerController" });
  }
};

 const checkUsername = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { username, email } = req.body;

    // Validate that username and email are not undefined
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email must be provided" });
    }

    console.log("checkUsername - received request with username:", username, "and email:", email);
    const result = await registerModel.checkUsernameAvailability(username, email);

    console.log("Result from checkUsernameAvailability:", result);

    if (result === undefined) {
      return res.status(500).json({ error: "Invalid data received from database" });
    }

    return handleAvailabilityResponse(res, result);

  } catch (error) {
    console.error("Error in checkUsername:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


 const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const userData = {
            name, username, email, password
        };
        const userId = await registerModel.createUser(userData);
        res.status(201).json({ userId });

    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
let loginButton;
function setLoginButton(button){
    loginButton = button;
}
export { handleRegistrationSubmit, setConstants, setLoginButton, checkUsername, registerUser }


