import db from "../config/db";

async function addUserPresense(data : any){

    console.log(data);
    
    const [loginUsers] : any = await db.promise().query("Select * from userPresense");

    console.log("user Presense : " , loginUsers);
    
    const userExists = loginUsers.some((user:any) => user.userId === data.userId);

    console.log(userExists);
    
    if(!userExists)
    {
        console.log("hello");
        
        return await db
          .promise()
          .query("INSERT INTO userPresense (userId, socketId) VALUES (?, ?)", [
            data.userId,
            data.socketId,
          ]);
    }
    else
    {
        console.log("update");
        return await db.promise().query("UPDATE userPresense SET socketId = ? WHERE userId = ?",[data.socketId,data.userId]);
        
    }   
}

async function fetchAllLoginUser()
{
    const [x] =  await db.promise().query("select * from userpresense");
    console.log("hiren : " , x);
    return x;
    
}

async function fetchAllUserList()
{
    const [userList]:any = await db.promise().query("SELECT * FROM taskManager.users");
    console.log("all userList : " , userList);
    return userList;
    
}

export { addUserPresense, fetchAllLoginUser, fetchAllUserList};