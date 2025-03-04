import { queryDatabase } from "../config/db.js";

class taskModel {
  
  async createTask(
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

  async viewTasksByUserIdAndProjectId(userId, projectId) {
    try {
      let query;
      let params;
      
      if (projectId) {
          query = 'CALL GetUserProjectsTasksByUserIdAndProjectId(?, ?)';
          params = [userId, projectId];
      } else {
          query = 'CALL GetUserProjectsTasksByUserId(?)';
          params = [userId];
      }

      const [rows] = await queryDatabase(query, params);
      return rows[0];
    } catch (error) {
      console.error('Error viewing tasks by user ID and/or project ID:', error);
      throw new Error('Failed to view tasks by user ID and/or project ID.');
    }
  }
  
  async updateTask(taskId,projectId, taskName, taskDescription, taskDueDate, taskPriority, taskStatus) {
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

  async deleteTask(taskId) {
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
 
   async getTaskProgressByUserId(userId) {
     try {
       const [rows] = await queryDatabase('CALL GetTaskProgressByUserId(?)', [userId]);
       console.log('Task progress rows [0][0]:', rows[0][0]);
       return rows[0][0];
     } catch (error) {
       console.error('Error getting task progress by user ID:', error);
       throw new Error('Failed to get task progress by user ID.');
     }
   }
};
export default new taskModel();











