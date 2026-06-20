// made this all by my self => and it worked

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req,res,next)=>{

    try{

        const {token} = req.cookies;
    
        if(!token) throw new Error("Token is not present");
        
        const payload = jwt.verify( token , process.env.JWT_KEY );
        
        const {_id} = payload;
        
        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);
        
        if(!result) throw new Error("User Doesn't Exist"); // may be isse delete krdiya ho databse se

        // redis ke blocklist mein present toh nahi hai
        
        const IsBlocked = await redisClient.exists(`token:${token}`);
        
        if(IsBlocked) throw new Error("Invalid Token");

        req.result = result;


        if(payload.role==='admin') next();
        else throw new Error("Invalid Credentials (for checking purposes => you are not an admin)");

    }
    catch(err){
        res.send("Error FROM ADMIN MIDDLEWARE : "+err.message);
    }
}

module.exports = adminMiddleware;