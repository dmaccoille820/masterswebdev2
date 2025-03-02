import bcrypt from 'bcrypt';
import { queryDatabase } from '../config/db.js';

async function authenticateUser(usernameOrEmail, password) {
    try {
        console.log("In authenticateUser in loginModel with ", usernameOrEmail, password);
        const [findUserResult] = await queryDatabase('CALL FindUserByUsernameOrEmail(?, @p_user_id_out)', [usernameOrEmail]);

        console.log("findUserResult:", findUserResult);
        if (!findUserResult[0] || findUserResult[0].length === 0) {
            console.log("User not found");
            return null;
        }
        const user = findUserResult[0].user_id_out;
        console.log("user:", user);
        const user_id_out = user;

        // Check if user_id_out is -1 (user not found)
        if (user_id_out === -1) {
            console.log("User not found with username or email. User_id_out",user_id_out);
            return null; // Return null to indicate user not found
        }

        const [userDataResult] = await queryDatabase('CALL FindUserById(?)', [user_id_out]);
        if (!userDataResult[0] || userDataResult[0].length === 0) {
            console.log("User not found");
            return null;
        }
        const userData = userDataResult[0];
        console.log("userData", userData);

        const isPasswordValid = await bcrypt.compare(password, userData.password);
        console.log("isPasswordValid: ", isPasswordValid);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
        }

        return {
            user_id: user_id_out,
            name: userData.name,
            username: userData.username,
            email: userData.email,
        };
    } catch (error) {
        console.error("Error in authenticateUser:", error);
        throw new Error("error validating credentials");
    }
}

export { authenticateUser };
