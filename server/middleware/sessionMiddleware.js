import { validateSession, createNewSession, updateSessionUser } from '../models/sessionModel.js';

const verifySession = async (req, res, next) => {
  console.log("verifying session");
  const sessionId = req.cookies.sessionId;
  const userId = req.headers.user_id;
  console.log("sessionId: ", sessionId);
  console.log("userId: ", userId);

  // Log the values received by the middleware
  console.log("verifySession - Received headers:");
  console.log("  sessionid:", sessionId);
  console.log("  user_id:", userId);

  try {
    if (!sessionId) {
      console.error("No sessionId or userId found in headers.");
      return res
        .status(401)
        .json({ message: "No sessionId or userId found in headers." });
    }

    const session = await validateSession(sessionId);
    console.log("verifySession - session:", session);
    if (!session) {
      console.error("Invalid session.");
      return res.status(401).json({ message: "Invalid session." });
    }

    next();
  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ message: "Session verification error." });
  }
};

export { verifySession, updateSessionUser, createNewSession, validateSession };
