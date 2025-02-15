import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import cors from "cors";
import session from "express-session";
import registerRoutes from "./server/routes/auth/registerRoutes.js";
import loginRoutes from "./server/routes/auth/loginRoutes.js";
import dashboardRoutes from "./server/routes/dashboardRoutes.js";
import projectRoutes from "./server/routes/projectRoutes.js"; 
import tasksRoutes from "./server/routes/tasksRoutes.js";
import fs from 'fs';
import { validateRegistration, preventLoggedIn } from "./server/middleware/registerMiddleware.js";
import { sessionMiddleware } from './server/middleware/sessionMiddleware.js'; // Import sessionMiddleware

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, 'client');
const port = process.env.PORT || 3000;

// Read the secret key from the file
let secretKey;
try {
  secretKey = fs.readFileSync(path.join(__dirname, 'server/secret_key2.txt'), 'utf8').trim();
} catch (err) {
  console.error('Error reading secret key file:', err);
  process.exit(1);
}

const staticOptions = {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
};

// Serve static files FIRST
app.use(express.static(clientDir, staticOptions));

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  })
);

// Apply sessionMiddleware to protect routes that need it
app.use(sessionMiddleware);

// Apply registerMiddleware to /api/auth/register
app.use("/api/auth/register", preventLoggedIn, validateRegistration, registerRoutes);
app.use("/api/auth/login", loginRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", projectRoutes); 
app.use("/api/tasks", tasksRoutes);

// catch dashboard route
app.get("/api/dashboard", (req, res) => { 
  res.sendFile(path.join(clientDir, 'dashboard.html'));
});

// catch all route
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
