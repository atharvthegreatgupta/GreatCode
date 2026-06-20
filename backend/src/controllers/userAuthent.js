const User = require('../models/user'); // .. => parent folder and . => current folder

const Submission = require('../models/submission');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const redisClient = require('../config/redis');

const register = async (req,res)=>{

    try{
        
        // validate the data
        validate(req.body);

        const {firstName,emailId,password} = req.body;

        req.body.password = await bcrypt.hash(password,10);

        req.body.role = "user";

        const user = await User.create(req.body);

        const reply = {

            firstName : user.firstName,

            emailId : user.emailId,

            _id : user._id,

            role : user.role
        }

        const token = jwt.sign({_id : user._id,emailId : emailId,role : req.body.role},process.env.JWT_KEY,{expiresIn: 60*60});

        // res.cookie('token',token,{maxAge: 60*60*1000}); // max age is in milli seconds, aur ek hr ek baad fronend se bhi ht jayega token
        
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.status(200).json({
            user:reply,
            message:"Registered Succlessfully"
        });
    }
    catch(err){

        res.status(400).send("Error : "+err.message);

    }
}

const login = async (req,res)=>{

    try{

        const {emailId,password} = req.body;

        if(!emailId || !password) throw new Error("Invalid Credentials");

        const user =  await User.findOne({emailId}); 

        if(!user){ // if user does not exist, user = null
            return res.status(404).send("User not found");
        }
        
        const match = await bcrypt.compare(password,user.password); 

        if(!match) throw new Error("Invalid Credentials");

        const reply = {

            firstName : user.firstName,

            emailId : user.emailId,

            _id : user._id,

            role : user.role
        }

        const token = jwt.sign({_id : user._id,emailId : emailId,role : user.role},process.env.JWT_KEY,{expiresIn: 60*60});

        // res.cookie('token',token,{maxAge: 60*60*1000}); // max age is in milli seconds, aur ek hr ek baad fronend se bhi ht jayega token
        
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });
        
        res.status(201).json({
            user:reply,
            message:"Loggin Succlessfully"
        });
    }
    catch(err){

        res.status(401).send("Error: "+err.message);

    }
}

const logout = async (req,res)=>{

    try{

        // validate the token => hogya vo middleware mai
        // add the token in the redis blocklist
        // clear krdenge cookies ko

        const {token} = req.cookies;

        const payload = jwt.decode( token );

        await redisClient.set( `token:${token}` , `Blocked` ); // blocked is the value
        await redisClient.expireAt( `token:${token}` , payload.exp ); // redis tb hta dena jb vo token expier hojaye

        res.cookie( "token" , null , {expires : new Date(Date.now())} ); // token bej rahe hain cookie mai vo ki null hai abhi ki abhi hi expire hojayega
        res.send("Logged Out Successfully");

    }
    catch(err){

        res.status(503).send("Error: "+err.message); // 503 means -> problem in the server

    }
    
}

const adminRegister = async (req,res)=>{ // sir ne alag tarah se implement kra hai admin registration.. in his way he made a new person registered as an admin.. but in my way i made an existing person admin.. like in my way the person will have to regiter normally first then any of the admin can make him admin in a very simple manner

    const email_of_new_employee = req.body.email_of_new_employee;

    const user = await User.findOne({emailId:email_of_new_employee});

    if(!user){
        return res.send("user does not exist, therefore he/she cannot be made admin");
    }

    user.role = "admin"; // changes
    
    await user.save(); // saving the changes back to the database

    res.send( ` ${user.firstName} is now an admin... SUCCESSFULL ` );

}

const deleteProfile = async(req,res)=>{

    try{

        const userId = req.result._id;

        // userSchema delete
        await User.findByIdAndDelete(userId);

        // submission bhi delete krne hain
        // await Submission.deleteMany( {userId} ); // or just write a post command in the UserSchema

        res.status(200).send( "Delete Successfully" );
    }
    catch(err){

        res.status(500).send( "Internal Server Error" );
    }
}

module.exports = {register : register , login : login , logout : logout, adminRegister : adminRegister,deleteProfile};