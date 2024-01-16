import express, { json, response, text, urlencoded } from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import db from "./config/db";
import dotenv from "dotenv";
import authController from "./Controller/authController";
import taskController from "./Controller/taskController";
import ACTIONS from "./Actions/Actions";
import { addUserPresense, fetchAllLoginUser } from "./Services/commonService";
import { error, log } from "console";

const app = express();
app.use(cors());
app.use(json({ limit: "200mb" }));
app.use(text());

dotenv.config();

app.use(
  urlencoded({ extended: true, limit: "200mb", parameterLimit: 100000000 })
);

console.log("server reached...");
const server = http.createServer(app);

let io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", async (socket) => {
  // socket.on(ACTIONS.LOGIN, async (data: any) => {
  //   try {
  //     // Assuming addUserPresense returns a Promise

  //     console.log(
  //       "socketId checking...",
  //       data.socketId,
  //       socket.id,
  //       socket.rooms
  //     );
  //     await addUserPresense({
  //       userId: data.userId,
  //       socketId: socket.id,
  //     });

  //     const loginUsers: any = await fetchAllLoginUser();

  //     const filteredLoginUsers = loginUsers.filter(
  //       (user: any) => user.userId !== data.userId
  //     );

  //     const socketIds = filteredLoginUsers.map((user: any) => user.socketId);

  //     // socket.join(ACTIONS.USER_ADDED);

  //     socket.join([ACTIONS.USER_ADDED, ACTIONS.TASK_DELETED]);

  //     console.log(socket.rooms);

  //     io.to(socketIds).emit(
  //       ACTIONS.JOINED,
  //       loginUsers,
  //       data.username,
  //       socket.id
  //     );

  //     // socket.broadcast.emit(
  //     //   ACTIONS.JOINED,
  //     //   loginUsers,
  //     //   data.username,
  //     //   socket.id
  //     // );
  //   } catch (error) {
  //     console.log(
  //       "Error while adding userPresense or fetching loginUsers: ",
  //       error
  //     );
  //   }
  // });

  socket.on(ACTIONS.TASK_DELETE, async (data: any) => {
    const taskId = data.taskId;
    const projectId = data.projectId;

    console.log("socket id delete , ", socket.id);

    const [projectUsers]: any = await db
      .promise()
      .query("SELECT userIds from taskManager.project WHERE pId=?", [
        projectId,
      ]);

    const [task] = await db
      .promise()
      .query("SELECT taskName FROM taskManager.task where taskId =?", [taskId]);

    const userIds = projectUsers[0].userIds.split(",");

    const [loginedUsers]: any = await db
      .promise()
      .query("SELECT * from taskManager.userPresense WHERE userId IN (?)", [
        userIds,
      ]);

    console.log("Logined users : ", loginedUsers);

    const currentSocketId = socket.id;

    // Filter out the current user from the list of recipients
    const recipients = loginedUsers
      .filter((user: any) => user.socketId !== currentSocketId)
      .map((user: any) => user.socketId);

    console.log("Recipients : ", recipients);

    console.log(socket.rooms);
    console.log(socket.id);
    console.log(recipients);
    // Broadcast the message to all recipients
    io.to(recipients).emit(ACTIONS.TASK_DELETED, {
      taskId: taskId,
      adminName: data.adminName,
    });
  });

  socket.on(ACTIONS.PROJECT_CREATE, async (data) => {
    console.log("project_create: ", data);

    const projectId = data.projectId;

    // Fetch user IDs from the project table
    const projectUsersResult: any = await db
      .promise()
      .query("SELECT * FROM taskManager.project WHERE pid=?", [projectId]);

    const projectName = projectUsersResult[0][0].projectName;

    // if (projectUsersResult[0].length > 0)
    {
      const userIdsString = projectUsersResult[0][0].userIds;

      const userIds = userIdsString.split(",").map((id: any) => parseInt(id));

      console.log("project users : ", userIds);

      // Fetch sockets for the user IDs from the users table
      const userSocketsResult = await db
        .promise()
        .query(
          "SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)",
          [userIds]
        );

      const loginedUsersSockets: any = userSocketsResult[0];

      console.log("User sockets: ", loginedUsersSockets);

      const recipients = loginedUsersSockets
        .filter((user: any) => user.socketId !== socket.id)
        .map((user: any) => user.socketId);

      console.log("Recipients : ", recipients);

      socket.join(ACTIONS.USER_ADDED);
      console.log(socket.rooms);
      console.log(socket.id);
      console.log(recipients);
      // Broadcast the message to all recipients
      io.to(recipients).emit(ACTIONS.PROJECT_CREATED, {
        projectName: projectName,
        adminName: data.adminName,
      });
    }
  });

  socket.on(ACTIONS.TASK_CREATE, async (data) => {
    console.log("TASK_CREATE called : ", data);

    const taskName: any = await db
      .promise()
      .query("SELECT taskName from task WHERE taskId=?", [data.taskId]);

    const userIdsStringArray: any = await db
      .promise()
      .query(
        "SELECT DISTINCT p.userIds,p.projectName,p.pid FROM taskManager.project p JOIN taskManager.task t ON p.pid = t.projectId WHERE t.taskId=?",
        [data.taskId]
      );

    const userIdsString: any = userIdsStringArray[0][0].userIds;
    const projectName: any = userIdsStringArray[0][0].projectName;
    const projectId: any = userIdsStringArray[0][0].pid;

    const userIds = userIdsString.split(",").map((id: any) => parseInt(id));

    console.log("project users : ", userIds);

    // Fetch sockets for the user IDs from the users table
    const userSocketsResult = await db
      .promise()
      .query(
        "SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)",
        [userIds]
      );

    const loginedUsersSockets: any = userSocketsResult[0];

    console.log("User sockets: ", loginedUsersSockets);

    const recipients = loginedUsersSockets
      .filter((user: any) => user.socketId !== socket.id)
      .map((user: any) => user.socketId);

    console.log("Recipients : ", recipients);

    socket.join(ACTIONS.USER_ADDED);
    console.log(socket.rooms);
    console.log(socket.id);
    console.log(recipients);
    // Broadcast the message to all recipients

      io.to(recipients).emit(ACTIONS.TASK_CREATED, {
      projectName: projectName,
      adminName: data.adminName,
      taskName: taskName[0][0].taskName,
      projectId: projectId,
    });
  });

  socket.on(ACTIONS.TASK_UPDATE, async (data) => {
    console.log("TASK_UPDATE called : ", data);

    const taskName: any = await db
      .promise()
      .query("SELECT taskName from task WHERE taskId=?", [data.taskId]);

    const userIdsStringArray: any = await db
      .promise()
      .query(
        "SELECT DISTINCT p.userIds,p.projectName,p.pid FROM taskManager.project p JOIN taskManager.task t ON p.pid = t.projectId WHERE t.taskId=?",
        [data.taskId]
      );

    const userIdsString: any = userIdsStringArray[0][0].userIds;
    const projectName: any = userIdsStringArray[0][0].projectName;
    const projectId: any = userIdsStringArray[0][0].pid;

    const userIds = userIdsString.split(",").map((id: any) => parseInt(id));

    console.log("project users : ", userIds);

    // Fetch sockets for the user IDs from the users table
    const userSocketsResult = await db
      .promise()
      .query(
        "SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)",
        [userIds]
      );

    const loginedUsersSockets: any = userSocketsResult[0];

    console.log("User sockets: ", loginedUsersSockets);

    const recipients = loginedUsersSockets
      .filter((user: any) => user.socketId !== socket.id)
      .map((user: any) => user.socketId);

    console.log("Recipients : ", recipients);

    socket.join(ACTIONS.USER_ADDED);
    console.log(socket.rooms);
    console.log(socket.id);
    console.log(recipients);

    io.to(recipients).emit(ACTIONS.TASK_UPDATED,{
      taskId : data.taskId,
      projectName: projectName,
      adminName: data.adminName,
      taskName: taskName[0][0].taskName,
      projectId: projectId,
    });

  });
});

//route
app.use("/Users", authController);
app.use("/Assign", taskController);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
