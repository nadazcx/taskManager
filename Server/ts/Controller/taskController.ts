import express from "express";
import db from "../config/db";
import { fetchAllUserList } from "../Services/commonService";
import { FieldPacket, RowDataPacket } from "mysql2";
import { stringify } from "querystring";
import { ppid } from "process";
const router = express.Router();

router.post("/getProjectsByUserId", async (req: any, res: any) => {
  try {
    const userId = req.body.userId;

    const [projects] = await (db
      .promise()
      .query("SELECT * FROM project WHERE FIND_IN_SET(?, userIds)", [userId]) as Promise<[RowDataPacket[], FieldPacket[]]>);

    const userIds: number[] = [];
    for (const project of projects) {
      userIds.push(...(project.userIds as string).split(',').map(Number));
    }

    // Use type assertion for the result of the users query
    const [users] = await (db
      .promise()
      .query("SELECT DISTINCT username FROM users WHERE userId IN (?)", [userIds]) as Promise<[RowDataPacket[], FieldPacket[]]>);

    // Extract usernames into an array
    const usernames: string[] = users.map((user) => user.username);

    // Add usernames to the projects with the first one as the owner
    const projectsWithUsernames: any[] = projects.map((project) => {
      const projectUserIds: number[] = (project.userIds as string).split(',').map(Number);
      const projectUsernames: string[] = usernames.filter((username, index) => projectUserIds.includes(userIds[index]));

      console.log("usernames:", projectUsernames, "pid:", project.pid);

      return {
        pid: project.pid,
        projectName: project.projectName,
        usernames: projectUsernames,
        owner: projectUsernames[0],
        // Add other project details as needed
      };
    });

    res.json({ projects: projectsWithUsernames });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
