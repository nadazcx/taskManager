import { FieldPacket, RowDataPacket } from "mysql2";


interface User  extends RowDataPacket {
    username : string;
    password : string;
    usersId : string;
}

export default User;

