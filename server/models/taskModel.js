import { queryDatabase } from "../config/db.js";


  
  async function createTask(
    projectId,
    taskName,
    taskDescription,
    taskDueDate,
    taskPriority,
    taskStatus
  ) {
    try {
      const result = await queryDatabase(
        "CALL InsertTask(?, ?, ?, ?, ?, ?)",
        [projectId, taskName, taskDescription, taskDueDate, taskPriority, taskStatus]
      );
      return result;
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error("Failed to create task.");
    }
  }

  
  
  async function updateTask(taskId,projectId, taskName, taskDescription, taskDueDate, taskPriority, taskStatus) {
    try {
      const result = await queryDatabase(
        "CALL UpdateTask(?, ?, ?, ?, ?, ?, ?)",
        [taskId,projectId, taskName, taskDescription, taskDueDate, taskPriority, taskStatus]
      );
      return result;
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task.");
    }
  }

  async function deleteTask(taskId) {
    try {
      const result = await queryDatabase(
        "CALL DeleteTask(?)",
        [taskId]
      );
      return result;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task.");
    }
  }
 
   async function getTaskProgressByUserId(userId) {
     try {
       const [rows] = await queryDatabase('CALL GetTaskProgressByUserId(?)', [userId]);
       console.log('Task progress rows [0]:', rows[0]);
       return rows[0];
     } catch (error) {
       console.error('Error getting task progress by user ID:', error);
       throw new Error('Failed to get task progress by user ID.');
     }
   }
   async function getTasksByProjectId(project_id) {
    try {
      const [tasks] = await queryDatabase('CALL GetTasksByProjectId(?)', [project_id]);
      console.log('Task rows:', tasks);
      return tasks[0];
    } catch (error) {
      console.error('Error getting tasks by project ID:', error);
      throw new Error('Failed to get tasks by project ID');
    }
  }

export { createTask, updateTask, deleteTask, getTaskProgressByUserId, getTasksByProjectId };











