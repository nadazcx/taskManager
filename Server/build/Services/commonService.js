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
exports.fetchAllUserList = exports.fetchAllLoginUser = exports.addUserPresense = void 0;
const db_1 = __importDefault(require("../config/db"));
function addUserPresense(data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(data);
        const [loginUsers] = yield db_1.default.promise().query("Select * from userPresense");
        console.log("user Presense : ", loginUsers);
        const userExists = loginUsers.some((user) => user.userId === data.userId);
        console.log(userExists);
        if (!userExists) {
            console.log("hello");
            return yield db_1.default
                .promise()
                .query("INSERT INTO userPresense (userId, socketId) VALUES (?, ?)", [
                data.userId,
                data.socketId,
            ]);
        }
        else {
            console.log("update");
            return yield db_1.default.promise().query("UPDATE userPresense SET socketId = ? WHERE userId = ?", [data.socketId, data.userId]);
        }
    });
}
exports.addUserPresense = addUserPresense;
function fetchAllLoginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const [x] = yield db_1.default.promise().query("select * from userpresense");
        console.log("hiren : ", x);
        return x;
    });
}
exports.fetchAllLoginUser = fetchAllLoginUser;
function fetchAllUserList() {
    return __awaiter(this, void 0, void 0, function* () {
        const [userList] = yield db_1.default.promise().query("SELECT * FROM taskManager.users");
        console.log("all userList : ", userList);
        return userList;
    });
}
exports.fetchAllUserList = fetchAllUserList;
