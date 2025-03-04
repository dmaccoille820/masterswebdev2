import express from 'express';
import * as tasksController from "../controllers/tasksController.js";
import { validateSession } from '../middleware/sessionMiddleware.js';

const router = express.Router();

// Define task-related routes
router.get("/", validateSession, tasksController.getAllTasksByUserID); // Apply sessionMiddleware here
router.post("/", validateSession, tasksController.createTask);
router.put("/:taskId", validateSession, tasksController.updateTask); // Apply sessionMiddleware here
router.delete("/:taskId", validateSession, tasksController.deleteTask); // Apply sessionMiddleware here

export default router;
