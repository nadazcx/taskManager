"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const authController_1 = __importDefault(require("./Controller/authController"));
const taskController_1 = __importDefault(require("./Controller/taskController"));
const Actions_1 = __importDefault(require("./Actions/Actions"));
const commonService_1 = require("./Services/commonService");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, express_1.json)({ limit: "200mb" }));
app.use((0, express_1.text)());
dotenv_1.default.config();
app.use((0, express_1.urlencoded)({ extended: true, limit: "200mb", parameterLimit: 100000000 }));
console.log("server reached...");
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    socket.on(Actions_1.default.LOGIN, (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Assuming addUserPresense returns a Promise
            console.log("socketId checking...", data.socketId, socket.id, socket.rooms);
            yield (0, commonService_1.addUserPresense)({
                userId: data.userId,
                socketId: socket.id,
            });
            const loginUsers = yield (0, commonService_1.fetchAllLoginUser)();
            const filteredLoginUsers = loginUsers.filter((user) => user.userId !== data.userId);
            const socketIds = filteredLoginUsers.map((user) => user.socketId);
            // socket.join(ACTIONS.USER_ADDED);
            socket.join([Actions_1.default.USER_ADDED, Actions_1.default.TASK_DELETED]);
            console.log(socket.rooms);
            io.to(socketIds).emit(Actions_1.default.JOINED, loginUsers, data.username, socket.id);
            // socket.broadcast.emit(
            //   ACTIONS.JOINED,
            //   loginUsers,
            //   data.username,
            //   socket.id
            // );
        }
        catch (error) {
            console.log("Error while adding userPresense or fetching loginUsers: ", error);
        }
    }));
    socket.on(Actions_1.default.TASK_DELETE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        const taskId = data.taskId;
        const projectId = data.projectId;
        console.log("socket id delete , ", socket.id);
        const [projectUsers] = yield db_1.default
            .promise()
            .query("SELECT userIds from taskManager.project WHERE pId=?", [
            projectId,
        ]);
        const [task] = yield db_1.default
            .promise()
            .query("SELECT taskName FROM taskManager.task where taskId =?", [taskId]);
        const userIds = projectUsers[0].userIds.split(",");
        const [loginedUsers] = yield db_1.default
            .promise()
            .query("SELECT * from taskManager.userPresense WHERE userId IN (?)", [
            userIds,
        ]);
        console.log("Logined users : ", loginedUsers);
        const currentSocketId = socket.id;
        // Filter out the current user from the list of recipients
        const recipients = loginedUsers
            .filter((user) => user.socketId !== currentSocketId)
            .map((user) => user.socketId);
        console.log("Recipients : ", recipients);
        console.log(socket.rooms);
        console.log(socket.id);
        console.log(recipients);
        // Broadcast the message to all recipients
        io.to(recipients).emit(Actions_1.default.TASK_DELETED, {
            taskId: taskId,
            adminName: data.adminName,
        });
    }));
    socket.on(Actions_1.default.PROJECT_CREATE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("project_create: ", data);
        const projectId = data.projectId;
        // Fetch user IDs from the project table
        const projectUsersResult = yield db_1.default
            .promise()
            .query("SELECT * FROM taskManager.project WHERE pid=?", [projectId]);
        const projectName = projectUsersResult[0][0].projectName;
        // if (projectUsersResult[0].length > 0)
        {
            const userIdsString = projectUsersResult[0][0].userIds;
            const userIds = userIdsString.split(",").map((id) => parseInt(id));
            console.log("project users : ", userIds);
            // Fetch sockets for the user IDs from the users table
            const userSocketsResult = yield db_1.default
                .promise()
                .query("SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)", [userIds]);
            const loginedUsersSockets = userSocketsResult[0];
            console.log("User sockets: ", loginedUsersSockets);
            const recipients = loginedUsersSockets
                .filter((user) => user.socketId !== socket.id)
                .map((user) => user.socketId);
            console.log("Recipients : ", recipients);
            socket.join(Actions_1.default.USER_ADDED);
            console.log(socket.rooms);
            console.log(socket.id);
            console.log(recipients);
            // Broadcast the message to all recipients
            io.to(recipients).emit(Actions_1.default.PROJECT_CREATED, {
                projectName: projectName,
                adminName: data.adminName,
            });
        }
    }));
    socket.on(Actions_1.default.TASK_CREATE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("TASK_CREATE called : ", data);
        const taskName = yield db_1.default
            .promise()
            .query("SELECT taskName from task WHERE taskId=?", [data.taskId]);
        const userIdsStringArray = yield db_1.default
            .promise()
            .query("SELECT DISTINCT p.userIds,p.projectName,p.pid FROM taskManager.project p JOIN taskManager.task t ON p.pid = t.projectId WHERE t.taskId=?", [data.taskId]);
        const userIdsString = userIdsStringArray[0][0].userIds;
        const projectName = userIdsStringArray[0][0].projectName;
        const projectId = userIdsStringArray[0][0].pid;
        const userIds = userIdsString.split(",").map((id) => parseInt(id));
        console.log("project users : ", userIds);
        // Fetch sockets for the user IDs from the users table
        const userSocketsResult = yield db_1.default
            .promise()
            .query("SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)", [userIds]);
        const loginedUsersSockets = userSocketsResult[0];
        console.log("User sockets: ", loginedUsersSockets);
        const recipients = loginedUsersSockets
            .filter((user) => user.socketId !== socket.id)
            .map((user) => user.socketId);
        console.log("Recipients : ", recipients);
        socket.join(Actions_1.default.USER_ADDED);
        console.log(socket.rooms);
        console.log(socket.id);
        console.log(recipients);
        // Broadcast the message to all recipients
        io.to(recipients).emit(Actions_1.default.TASK_CREATED, {
            projectName: projectName,
            adminName: data.adminName,
            taskName: taskName[0][0].taskName,
            projectId: projectId,
        });
    }));
    socket.on(Actions_1.default.TASK_UPDATE, (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("TASK_UPDATE called : ", data);
        const taskName = yield db_1.default
            .promise()
            .query("SELECT taskName from task WHERE taskId=?", [data.taskId]);
        const userIdsStringArray = yield db_1.default
            .promise()
            .query("SELECT DISTINCT p.userIds,p.projectName,p.pid FROM taskManager.project p JOIN taskManager.task t ON p.pid = t.projectId WHERE t.taskId=?", [data.taskId]);
        const userIdsString = userIdsStringArray[0][0].userIds;
        const projectName = userIdsStringArray[0][0].projectName;
        const projectId = userIdsStringArray[0][0].pid;
        const userIds = userIdsString.split(",").map((id) => parseInt(id));
        console.log("project users : ", userIds);
        // Fetch sockets for the user IDs from the users table
        const userSocketsResult = yield db_1.default
            .promise()
            .query("SELECT userId, socketId FROM taskManager.userPresense WHERE userId IN (?)", [userIds]);
        const loginedUsersSockets = userSocketsResult[0];
        console.log("User sockets: ", loginedUsersSockets);
        const recipients = loginedUsersSockets
            .filter((user) => user.socketId !== socket.id)
            .map((user) => user.socketId);
        console.log("Recipients : ", recipients);
        socket.join(Actions_1.default.USER_ADDED);
        console.log(socket.rooms);
        console.log(socket.id);
        console.log(recipients);
        io.to(recipients).emit(Actions_1.default.TASK_UPDATED, {
            taskId: data.taskId,
            projectName: projectName,
            adminName: data.adminName,
            taskName: taskName[0][0].taskName,
            projectId: projectId,
        });
    }));
}));
//route
app.use("/Users", authController_1.default);
app.use("/Assign", taskController_1.default);
const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
