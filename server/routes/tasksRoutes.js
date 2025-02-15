import express from 'express';
import * as tasksController from "../controllers/tasksController.js";
import { sessionMiddleware } from '../middleware/sessionMiddleware.js';

const router = express.Router();

// Define task-related routes
router.get("/", sessionMiddleware, tasksController.getAllTasksByUserID); // Apply sessionMiddleware here
router.post("/", sessionMiddleware, tasksController.createTask);
router.put("/:taskId", sessionMiddleware, tasksController.updateTask); // Apply sessionMiddleware here
router.delete("/:taskId", sessionMiddleware, tasksController.deleteTask); // Apply sessionMiddleware here

export default router;
