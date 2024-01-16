import express from "express";
import db from "../config/db";
import { fetchAllUserList } from "../Services/commonService";
const router = express.Router();

router.post("/getProjectsByUserId", async (req: any, res: any) => {
  try {
    const userId = req.body.userId;
    const [projects]: any = await db
      .promise()
      .query("SELECT * FROM project WHERE FIND_IN_SET(?, userIds)", [userId]);

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getProjectDetailsByPid/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // Fetch project details from the database based on the project ID
    const [project]: any = await db
      .promise()
      .query("SELECT * FROM project WHERE pid=?", [pid]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch user IDs associated with the project
    const userIds = project[0].userIds.split(',').map(Number);

    // Fetch usernames for each user ID
    const [users]: any = await db
      .promise()
      .query("SELECT userId, username FROM users WHERE userId IN (?)", [userIds]);

    // Create an array with user details
    const usersDetails = users.map((user: any) => ({
      userId: user.userId,
      username: user.username,
      // Add other user details as needed
    }));

    // Customize the response based on your project structure
    const projectDetails = {
      pid: project[0].pid,
      projectName: project[0].projectName,
      users: usersDetails,
      // Add other project details as needed
    };

    res.json(projectDetails);
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/createProject", async (req: any, res: any) => {
  try {
    console.log(req.body);
    const { projectName, userIds } = req.body;

    const [project]: any = await db
      .promise()
      .query("INSERT INTO project (projectName, userIds) VALUES (?,?)", [
        projectName,
        userIds,
      ]);

    res.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/fetchAllUserList", async (req: any, res: any) => {
  try {
    const [userList]: any = await db
      .promise()
      .query("SELECT userId,username FROM taskManager.users");
    res.json({ userList });
  } catch (error) {
    console.error("Error fetching userList :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/getTaskbyProjectId", async (req: any, res: any) => {
  try {
    const projectId = req.body.projectId;

    const [tasks]: any = await db
      .promise()
      .query("SELECT * FROM task WHERE projectId = ?", [projectId]);

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/deleteTaskById/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const [result]: any = await db
      .promise()
      .query("SELECT projectId from taskManager.task where taskId=?", [taskId]);

    await db
      .promise()
      .query("DELETE FROM taskManager.task where taskId=?", [taskId]);

    res.json({
      success: true,
      message: "Task deleted successfully",
      projectId: result,
    });
  } catch (error) {
    console.error("Error while delete tasks : ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/deleteUserPresenseById/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await db
      .promise()
      .query("DELETE FROM userPresense WHERE userId = ?", [userId]);
    res.json({
      success: true,
      message: `user Presense deleted successfully for ${userId}`,
    });
  } catch (error) {
    console.error("Error while delete tasks : ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/createTasks", async (req, res) => {
  try {
    console.log(req.body);
    const { taskName, projectId } = req.body;

    if (!taskName || !projectId) {
      return res
        .status(400)
        .json({ error: "Please provide task name and projectId", status: 404 });
    }
    const [newlyCreatedTask]: any = await db
      .promise()
      .query("INSERT INTO task (taskName,projectId) VALUES (?,?)", [
        taskName,
        projectId,
      ]);

    res.json({ task: newlyCreatedTask, status: 200 });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/editTask", async (req, res) => {
  try {
    console.log(req.body);
    const { taskId, taskName, projectId } = req.body;

    if (!taskId || !taskName || !projectId) {
      return res
        .status(400)
        .json({ error: "Please provide task name and projectId", status: 404 });
    }
    const [updateResult]: any = await db
      .promise()
      .query("UPDATE task SET taskName =?,projectId =? WHERE taskId =?", [
        taskName,
        projectId,
        taskId,
      ]);

    if (updateResult.affectedRows > 0) {
      // Now, retrieve the updated task entry using a SELECT query
      const [updatedTask] : any = await db
        .promise()
        .query("SELECT * FROM task WHERE taskId = ?", [taskId]);

      // 'updatedTask' now contains the updated task entry
      console.log("Updated Task:", updatedTask);
      res.json({ task: updatedTask[0], status: 200 });
    } else {
      console.log("No rows were updated.");
      res.status(404).json({ error: "Task not found", status: 404 });
    }
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
