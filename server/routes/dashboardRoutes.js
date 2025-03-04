import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import * as tasksController from '../controllers/tasksController.js';
import { verifySession } from "../middleware/sessionMiddleware.js";
const router = express.Router();
router.get("/data", verifySession, dashboardController.getAllProjectsByUserId);
router.get("/api/tasks", tasksController.getTasksProgress);
router.get("/",dashboardController.getDashboard);
export default router;