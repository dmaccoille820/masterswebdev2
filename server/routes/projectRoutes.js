import express from 'express';
import { getProjectsByUserID } from '../models/projectsModel.js';

const router = express.Router();

router.post('/api/dashboard', async (req, res) => {
  const { userId } = req.body;
  try {
    const projects = await getProjectDetails(userId);
    console.log('Projects:', projects);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
