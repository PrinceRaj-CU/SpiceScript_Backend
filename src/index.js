import express from "express";
import cors from 'cors'
import mongoose from "mongoose"
import {userRouter} from "./routes/users.js"
import {recipesRouter} from "./routes/recipes.js"
import 'dotenv/config'

const app = express()
const port =process.env.PORT

app.use(express.json());
app.use(cors());
app.use("/auth", userRouter);
app.use("/recipes",recipesRouter);



app.listen(port, async()=>{
    try {
        console.log(`SERVER STARED!${port}`)
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Database is Connected")
    } catch (error) {
        console.log(error);
        
    }
});