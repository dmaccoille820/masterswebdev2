import { validateSession, createNewSession, updateSessionUser } from '../models/sessionModel.js';

const verifySession = async (req, res, next) => {
  console.log("verifying session");
  const sessionId = req.cookies.sessionId;
  
  console.log("sessionId: ", sessionId);

  // Log the values received by the middleware
  console.log("verifySession - Received headers:");
  console.log("  sessionid:", sessionId);

  try {
    if (!sessionId) {
      console.error("No sessionId found in cookies.");
      return res
        .status(401)
        .json({ message: "No sessionId found in cookies." });
    }

    const session = await validateSession(sessionId);
    console.log("verifySession - session:", session);
    if (!session) {
      console.error("Invalid session.");
      return res.status(401).json({ message: "Invalid session." });
    }
    req.session.sessionId = session.sessionId;
    req.session.userId = session.userId;
    next();
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ message: "Session verification error." });
  }
};


export { verifySession, updateSessionUser, createNewSession, validateSession };
