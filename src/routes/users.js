import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { UserModel } from "../models/Users.js";
import 'dotenv/config'

const router = express.Router()

router.post("/register", async(req, res)=>{
    const {username, password} = req.body;
    try {
        const user = await UserModel.findOne({username});
    if(user){
        return res.status(400).send("User already exists!");
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({username, password: hashedPassword});
    await newUser.save();
    res.status(201).json({msg: "User Registered Successfully!"});
    } catch (error) {
        console.log(error);
    }
});

router.post("/login", async (req, res)=>{
    const {username, password} = req.body;
    try {
        const user = await UserModel.findOne({username});

    if(!user){
        return res.status(400).send("User doesn't Exist!")
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).send("Password Is Incorrect!");
    }

    const token = jwt.sign({id: user._id}, process.env.Token_secretkey); //samajh nhi aaya yha
    console.log(token)
    res.json({token, userID: user._id});
    } catch (error) {
        console.log(error)
    }
    
});


export {router as userRouter};

export const verifyToken =(req, res, next) =>{
    console.log("i was here")
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token);
    if(token){
        jwt.verify(token, process.env.Token_secretkey, (error,decoded)=>{
            if(error) return res.sendStatus(403);
            req.user_id=  decoded.id
            next();
        });
    }else {
        res.sendStatus(401);
    }
} 