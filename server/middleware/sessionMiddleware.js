import { validateSession, createNewSession } from '../models/sessionModel.js';

const sessionMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId || null;
        console.log("sessionMiddleware - sessionId:", sessionId);
        console.log("sessionMiddleware - req.cookies:", req.cookies); // Log the entire cookies object

        if (sessionId) {
            console.log("sessionMiddleware - validating sessionId");
            // Validate the session
            const sessionResult = await validateSession(sessionId);
            console.log("sessionMiddleware - sessionResult:", sessionResult); // Log the session result

            if (sessionResult && sessionResult.userId) {
                req.userId = { user_id: sessionResult.userId };
                req.sessionId={sessionId: sessionId}
                console.log("sessionMiddleware - userId set:", req.userId); // Log when userId is set
            } else {
                res.clearCookie('sessionId');
                res.status(401).json({ message: 'Unauthorized: Invalid session' });
                return; // Stop further execution
            }
        } else {
            console.log("sessionMiddleware - No sessionId found");
            // No session ID found, but it's a protected path
            res.status(401).json({ message: 'Unauthorized: Session cookie required' });
            return;
        }

        //if there is a req.userId but no cookie, create a new session.
        if (req.userId && req.userId.user_id && !sessionId) {
            const userId = req.userId.user_id;
            const newSessionId = await createNewSession(userId);
            const sessionResult = { sessionId: newSessionId, userId: userId };
            res.cookie('sessionId', sessionResult.sessionId, {
                httpOnly: false,
                secure: false,
                maxAge: 3600000,
                path: '/',
            });
            req.userId = { user_id: sessionResult.userId };
            req.sessionId = { sessionId: newSessionId};
            console.log("sessionMiddleware - new sessionId created:", sessionResult.sessionId);
        }
         console.log("req.userId in sessionMiddleware:", req.userId);
         console.log("req.sessionId in sessionMiddleware:", req.sessionId);
        // Continue to the next middleware or route handler (if any)
        next();
    } catch (error) {
        console.error("sessionMiddleware - Error:", error);
        next();
    }
};

export { sessionMiddleware };
