import { queryDatabase } from "../config/db.js";

async function validateSession(sessionId) {
  console.log("validateSession - sessionId received:", sessionId, typeof sessionId);
  if (!sessionId) {
    console.log("validateSession - No sessionId provided");
    return null;
  }
  try {
    const result = await queryDatabase("CALL ValidateSession(?)", [sessionId]);
    if (!result || result.length === 0 || result[0].length === 0 || result[0][0].userId === null) {
      console.log("validateSession - Invalid sessionId");
      return null;
    }
    const userId = result[0][0].userId;
    
    console.log("validateSession - Valid sessionId:", sessionId, "userId:", userId);
    return { sessionId: sessionId, userId: userId };
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}


async function createNewSession(userId) {
  try {
    const [result] = await queryDatabase("CALL CreateSession(?,@p_session_id)", [userId]);
    console.log("result in createNewSession:", result);
    const sessionId = result[0].p_session_id; 
    console.log("sessionId in createNewSession:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Error creating new session:", error);
    throw error;
  }
}

async function updateSessionUser(sessionId, userId) {
  try {
    // Set the userId in Session storage
    console.log("sessionId in updateSessionUser:", sessionId);
    console.log("userId in updateSessionUser:", userId);
    await queryDatabase("CALL UpdateSessionUser(?, ?)", [sessionId, userId]);
  } catch (error) {
    console.error("Error updating session user:", error);
    throw error;
  }
}

export { validateSession, createNewSession, updateSessionUser };
