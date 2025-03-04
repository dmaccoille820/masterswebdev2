import { getProjectsByUserID } from "../models/projectsModel.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, "../../client");

const getAllProjectsByUserId = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    console.log("getAllProjectsByUserId: req.headers", req.headers);
    const projects = await getProjectsByUserID(userId);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects" });
  }
};
const getDashboard = (req, res) => {
  res.sendFile(path.join(clientDir, "dashboard.html"));
};

export { getDashboard, getAllProjectsByUserId };
