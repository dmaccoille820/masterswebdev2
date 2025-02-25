import express from "express";
import * as loginController from "../../controllers/auth/loginController.js";
import * as loginModel from "../../models/loginModel.js";
import {
  updateSessionUser,
  validateSession,
  createNewSession,
} from "../../models/sessionModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("about to authenticate user in loginRoutes", req.body);

    if (!req.body.usernameOrEmail || !req.body.password) {
      console.error("Username/email and password are required.");
      return res
        .status(400)
        .json({ message: "Username/email and password are required." });
    }

    const { status, safeUser, message } = await loginController.login(
      req.body.usernameOrEmail,
      req.body.password
    );
    console.log("status in loginRoutes", status, safeUser, message);
    if (status != 200) {
      return res.status(status).json({ message });
    }
    const user = await loginModel.authenticateUser(
      req.body.usernameOrEmail,
      req.body.password
    );
    console.log("user from loginModel Authentication", user);
    let sessionResult;
    try {
      console.log(
        "cookies session and user id:",
        req.cookies.sessionId,
        user.user_id
      );
      if (req.cookies && req.cookies.sessionId) {
        sessionResult = await validateSession(
          req.cookies.sessionId,
          user.user_id
        );
      } else {
        const newSessionId = await createNewSession(user.user_id);
        console.log("newSessionId:", newSessionId);
        sessionResult = { sessionId: newSessionId };
      }

      if (!sessionResult) {
        console.error("Failed to create or validate session");
        return res
          .status(500)
          .json({ message: "Failed to create or validate session." });
      }

      console.log(
        "sessionResult inside try before updateSessionUser:",
        sessionResult
      );

      sessionResult.userId = user.user_id;

      res.cookie("sessionId", sessionResult.sessionId, {
        httpOnly: false,
        secure: false,
        maxAge: 3600000,
        path: "/",
      });

      res.cookie("user_name", user.name, {
        httpOnly: false,
        secure: false,
        maxAge: 3600000,
        path: "/",
      });

      if (req.session) {
        req.session.name = user.username;
      }
      if (req.session) {
        req.session.sessionId = sessionResult.sessionId;
        req.session.userId = sessionResult.userId;
      }

      
      

    
        return res.status(200).json({ ...safeUser, sessionId: sessionResult.sessionId });

    } catch (err) {
      console.error("loginRoutes.js - Error getting user data:", err);
      return res.status(500).json({ message: "Internal server error at login" });
    } finally{
      try{
        console.log("sessionId", sessionResult.sessionId);
        console.log("userId", sessionResult.userId);
        await updateSessionUser(sessionResult.sessionId, sessionResult.userId);
        console.log("Session updated successfully");
      }catch(e){
        console.error("loginRoutes.js - Error updating session:", e);
      }
    }
  } catch (error) {
    console.error("loginRoutes.js - Error authenticating user:", error);
    res.status(500).json({ message: "Internal server error authenticating user" });
  }
 
});

export default router;
