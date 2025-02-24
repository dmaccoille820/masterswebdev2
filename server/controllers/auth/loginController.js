import * as loginModel from "../../models/loginModel.js";
import { queryDatabase } from '../../config/db.js';
import * as utils from "../../utils/validation.js";

const login = async (usernameOrEmail, password) => {

    async function getUserData(userId) {
        try {
            const usernameError = validateUsernameServer(usernameOrEmail);
            if (usernameError) {
                return { status: 400, message: usernameError };
            }
            const passwordError = validatePasswordServer(password);
            if (passwordError) {
                return { status: 400, message: passwordError };
            }
            console.log("In getUserData in loginController with ", userId);
            const [userDataResult] = await queryDatabase('CALL FindUserById(?)', [userId]);
            const userData = userDataResult[0];
            if (!userData) {
                console.log("User not found with id in getUserData");
                return { status: 401, message: "Invalid credentials." };
            }
            console.log("userData: ", userData);
            return userData;
        } catch (error) {
            console.error("Error in getUserData:", error);
            throw error;
        }
    }
    try {
        if (!usernameOrEmail || !password) {
            return { status: 400, message: "Username/Email and password are required" };
        }
        const user = await authenticateUser(usernameOrEmail, password);
        if (!user) {
            console.log("User Not Authenticated");
            return { status: 401, message: "Invalid credentials." };
        }

        // User is authenticated!  Send a success response with the user data
        // Create a client-safe user object
        const userData = await getUserData(user.user_id);
        if (userData.status) return userData
        const safeUser = {
            user_id: user.user_id, // Include userId
            username: user.username, // Include username
        };


        // Send a success response with the client-safe user data
        console.log("User Authenticated");
        return { status: 200, safeUser };


    } catch (error) {
        console.error('Error in login controller:', error);
        return { status: 500, message: "Internal server error" };
    }

};
async function handleLoginSubmit(form, elements) {
    const { loginUsername, loginPassword } = form;
  
    try {
      // Server side validation.
      if (loginUsername.trim().length < 3 || loginUsername.trim().length > 20) {
        return { error: "Username must be between 3 and 20 characters." };
      }
      if (loginPassword.trim().length < 8 || loginPassword.trim().length > 20) {
        return { error: "Password must be between 8 and 20 characters." };
      }
      //client side validation is already in place, but the server also needs to validate.
      if (!utils.validateUsernameClient(loginUsername)) {
        if(!utils.validateEmailClient(loginUsername)){
          return { error: "Invalid username/email format." };
        }
      }
      if (!utils.validatePasswordClient(loginPassword)) {
        return {
          error:
            "Password needs to be at least 8 characters, have an uppercase, lowercase, number, and special character.",
        };
      }
  
      const result = await loginModel.findUser(loginUsername, loginPassword);
      return result;
    } catch (error) {
      console.error("An error occurred during login:", error);
      return { error: "An unexpected error occurred during login." };
    }
  }
export { login , handleLoginSubmit };
