import express from 'express';
import {
  getTasksByProjectId, createTask, updateTask, deleteTask,} from '../models/taskModel.js';
import { verifySession } from '../middleware/sessionMiddleware.js';

const router = express.Router();
router.use(verifySession);//added

router.get('/', async (req, res) => {
  console.log('tasksRoutes - GET / - req.headers:', req.headers);//added
  console.log('tasksRoutes - GET / - req.query:', req.query);//added
  const { project_id } = req.query;
  console.log('tasksRoutes - GET / - project_id:', project_id);//added
  try {
    if (!project_id) {
      console.error('No project_id provided.');
      return res.status(400).json({ message: 'No project_id provided.' });
    }
    const tasks = await getTasksByProjectId(project_id);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { project_id, taskName, taskDescription, taskDueDate, taskPriority, taskStatus } = req.body;
    if (!project_id || !taskName || !taskDescription || !taskDueDate || !taskPriority || !taskStatus) {
      console.error('Missing fields in request body.');
      return res.status(400).json({ message: 'Missing fields in request body.' });
    }
    const newTask = await createTask(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = await updateTask(taskId, req.body);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    await deleteTask(taskId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

export default router;
