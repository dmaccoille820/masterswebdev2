import { queryDatabase } from "../config/db.js";


async function getProjectsByUserID(user_id)
    {
        try {
        const result = await queryDatabase("CALL GetUserProjectsTasksByUserId(?)", [user_id] );
          
        
        return result;
    } catch (error) {
        console.error("Error creating task:", error);
      throw new Error("Failed to getProjectsByUserID.");
    }
}

async function getProjectDetails(projectId) {
  try {
    const [projectsAndTasks] = await queryDatabase("CALL GetUserProjectsTasksByUserId(?)", [user_id]);
// for each project calculate the task count, project status, and latest due date

    const project_count = projectsAndTasks.length;
    const tasks = projectsAndTasks.filter(task => task.project_id === projectId);
    const task_count = tasks.length;
    // for each task in the project, check if it's completed 
    // if not, set the project status to "Incomplete"
    let project_status = "Complete";
    let latest_due_date = null;

    for (const task of tasks) {
      if (task.task_status !== "Completed") {
        project_status = "Incomplete";
      }
      if (!latest_due_date || task.due_date > latest_due_date) {
        latest_due_date = task.due_date;
      }
    }

    return {
      project_id: projectId,
      project_name: tasks[0].project_name,
      project_description: tasks[0].project_description,
      task_count,
      project_status,
      latest_due_date,
      tasks,
    };
  } catch (error) {
    console.error(`Error in getProjectDetails for project ${projectId}:`, error);
    throw error;
  }
}
export { getProjectsByUserID, getProjectDetails};
