"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
router.post("/getProjectsByUserId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        const [projects] = yield db_1.default
            .promise()
            .query("SELECT * FROM project WHERE FIND_IN_SET(?, userIds)", [userId]);
        res.json({ projects });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/getProjectDetailsByPid/:pid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pid } = req.params;
        // Fetch project details from the database based on the project ID
        const [project] = yield db_1.default
            .promise()
            .query("SELECT * FROM project WHERE pid=?", [pid]);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // You can customize the response based on your project structure
        const projectDetails = {
            pid: project[0].pid,
            projectName: project[0].projectName,
            // Add other project details as needed
        };
        res.status(200).json({ projectDetails });
    }
    catch (error) {
        console.error("Error fetching project details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
router.post("/createProject", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { projectName, userIds } = req.body;
        const [project] = yield db_1.default
            .promise()
            .query("INSERT INTO project (projectName, userIds) VALUES (?,?)", [
            projectName,
            userIds,
        ]);
        res.json({ project });
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/fetchAllUserList", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [userList] = yield db_1.default
            .promise()
            .query("SELECT userId,username FROM taskManager.users");
        res.json({ userList });
    }
    catch (error) {
        console.error("Error fetching userList :", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.post("/getTaskbyProjectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.body.projectId;
        const [tasks] = yield db_1.default
            .promise()
            .query("SELECT * FROM task WHERE projectId = ?", [projectId]);
        res.json({ tasks });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/deleteTaskById/:taskId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = req.params.taskId;
        const [result] = yield db_1.default
            .promise()
            .query("SELECT projectId from taskManager.task where taskId=?", [taskId]);
        yield db_1.default
            .promise()
            .query("DELETE FROM taskManager.task where taskId=?", [taskId]);
        res.json({
            success: true,
            message: "Task deleted successfully",
            projectId: result[0].projectId,
        });
    }
    catch (error) {
        console.error("Error while delete tasks : ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.get("/deleteUserPresenseById/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        yield db_1.default
            .promise()
            .query("DELETE FROM userPresense WHERE userId = ?", [userId]);
        res.json({
            success: true,
            message: `user Presense deleted successfully for ${userId}`,
        });
    }
    catch (error) {
        console.error("Error while delete tasks : ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.post("/createTasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { taskName, projectId } = req.body;
        if (!taskName || !projectId) {
            return res
                .status(400)
                .json({ error: "Please provide task name and projectId", status: 404 });
        }
        const [newlyCreatedTask] = yield db_1.default
            .promise()
            .query("INSERT INTO task (taskName,projectId) VALUES (?,?)", [
            taskName,
            projectId,
        ]);
        res.json({ task: newlyCreatedTask, status: 200 });
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
router.put("/editTask", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { taskId, taskName, projectId } = req.body;
        if (!taskId || !taskName || !projectId) {
            return res
                .status(400)
                .json({ error: "Please provide task name and projectId", status: 404 });
        }
        const [updateResult] = yield db_1.default
            .promise()
            .query("UPDATE task SET taskName =?,projectId =? WHERE taskId =?", [
            taskName,
            projectId,
            taskId,
        ]);
        if (updateResult.affectedRows > 0) {
            // Now, retrieve the updated task entry using a SELECT query
            const [updatedTask] = yield db_1.default
                .promise()
                .query("SELECT * FROM task WHERE taskId = ?", [taskId]);
            // 'updatedTask' now contains the updated task entry
            console.log("Updated Task:", updatedTask);
            res.json({ task: updatedTask[0], status: 200 });
        }
        else {
            console.log("No rows were updated.");
            res.status(404).json({ error: "Task not found", status: 404 });
        }
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
