import { queryDatabase } from "../config/db.js";

async function getProjectsByUserID(user_id) {
    try {
        const resultSets = await queryDatabase(
            "CALL GetUserProjectsTasksByUserId(?)",
            [user_id]
        );
        const tasksData = resultSets[0];

        // Transform the flat result set into an array of project objects with nested tasks
        const projects = {};
        tasksData.forEach((row) => {
            const projectId = row.project_id;
            if (!projects[projectId]) {
                projects[projectId] = {
                    project_id: projectId,
                    project_name: row.project_name,
                    project_description: row.project_description,
                    project_type: row.project_type,
                    project_status: row.project_status || "Incomplete",
                    latest_due_date: null,
                    tasks: [],
                    task_count: 0

                };
            }
            if (row.task_id) {
                projects[projectId].tasks.push({
                    task_id: row.task_id,
                    task_name: row.task_name,
                    task_description: row.task_description,
                    due_date: row.due_date,
                    priority: row.priority,
                    completion_status: row.completion_status,
                    task_creation_date: row.task_creation_date,
                });
                projects[projectId].task_count +=1;
                projects[projectId].latest_due_date = row.due_date;
            }
        });
        return Object.values(projects);
    } catch (error) {
        console.error("Error while getProjectsByUserID:", error);
        throw new Error("Failed to getProjectsByUserID.");
    }
}
export { getProjectsByUserID };
