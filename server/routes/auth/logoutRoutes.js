import express from "express";
import { queryDatabase } from "../../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const sessionId = req.cookies.sessionId;
console.log(sessionId);
  if (sessionId) {
    try {
      // CALL stored procedure DeleteSession to delete from sessions table with session_id
      const deleteProcedure = "CALL DeleteSession(?)";
      await queryDatabase(deleteProcedure, [sessionId]);
      res.clearCookie("sessionId", { httpOnly: false });
      res.clearCookie("user_name", { httpOnly: fasle });
      console.log("Logged out successfully.")

      res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Error during logout." });
    }
  } else {
    res.status(200).json({ message: "No active session to logout." });
  }
});

export default router;