import db from "../config/db";





async function fetchAllUserList()
{
    const [userList]:any = await db.promise().query("SELECT * FROM taskManager.users");
    console.log("all userList : " , userList);
    return userList;
    
}

export { fetchAllUserList};