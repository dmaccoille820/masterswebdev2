import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import cors from "cors";
import session from "express-session";
import registerRoutes from "./routes/auth/registerRoutes.js";
import loginRoutes from "./routes/auth/loginRoutes.js";
import logoutRoutes from "./routes/auth/logoutRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js"; 
import tasksRoutes from "./routes/tasksRoutes.js";
import fs from 'fs';
import { validateRegistration, preventLoggedIn } from "./middleware/registerMiddleware.js";
import { verifySession } from './middleware/sessionMiddleware.js'; 

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname,'..', 'client');
const port = process.env.PORT || 3000;

// Read the secret key from the file
let secretKey;
try {
  secretKey = fs.readFileSync(path.join(__dirname, 'secret_key2.txt'), 'utf8').trim();
} catch (err) {
  console.error('Error reading secret key file:', err);
  process.exit(1);
}

const staticOptions = {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
};

// Serve static files first
app.use(express.static(clientDir, staticOptions));
// Serve favicon
app.use('/images/favicon.ico', express.static(path.join(clientDir, 'favicon.ico')));

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: secretKey,
    resave: false,
    cookie: { maxAge: 360000, httpOnly: false, secure: false, path: "/" },
    saveUninitialized: true,
  })
);

// Apply sessionMiddleware before other routes
//app.use(sessionMiddleware);

// Apply middleware
app.use("/api/auth/register", preventLoggedIn, validateRegistration, registerRoutes);
app.use("/api/auth/login",  loginRoutes );
app.use("/api/auth/logout", logoutRoutes);
app.use("/api/dashboard", verifySession, dashboardRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/user-data",tasksRoutes);
app.use("/api/projects", projectRoutes);

app.get("/tasks", (req, res) => {
  res.sendFile(path.join(clientDir, 'tasks.html'));
});
app.get("/dashboard", (req, res) => { 
  res.sendFile(path.join(clientDir, 'dashboard.html'));
}); 
app.get("/tasks", (req, res) => {
  res.sendFile(path.join(clientDir, 'tasks.html'));
});
// catch all route
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
