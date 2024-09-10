import express from 'express'
import mongoose from 'mongoose';
import { RecipeModel } from "../models/Recipes.js";
import { UserModel } from '../models/Users.js';
import { verifyToken} from './users.js';

const router = express.Router();

//This route is going to show the add recipe that are created by the specific user
router.get("/", async(req,res)=>{
    const {page=1, limit = 8} = req.query;
    try {
        const recipes = await RecipeModel.find({}).limit(limit*1).skip((page-1)*limit).exec();

        const count= await RecipeModel.countDocuments();

        res.json({
            recipes,
            totalPages: Math.ceil(count/limit),
            currentPage: page,
        });
    } catch (error) {
        res.json(error);
    }
});

//This route is going to add the recipe that are added by the user 
router.post("/",async(req,res)=>{
    const recipe =new RecipeModel(req.body)
    try {
        const response = await recipe.save();
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});


//This route is going to saved the recipe that are selected by the user in user model
router.put("/",verifyToken, async(req,res)=>{

    try {
        const recipe = await RecipeModel.findById(req.body.recipeID)
        const user = await UserModel.findById(req.user_id)
         user.savedRecipes.push(recipe);
         await user.save();
        res.json({savedRecipes: user.savedRecipes});
    } catch (error) {
        res.json(error);
    }
});

//creating api to delete the saved recipe
router.patch("/delete",verifyToken,  async (req, res)=>{
    // console.log("Delete route hit");
    console.log(req.user_id);
    try {
        const removerecipe = await RecipeModel.findById(req.body.recipeID)
        const user = await UserModel.findById(req.user_id)
        const updatedRecipes = user.savedRecipes.filter(
            (removerecipe) => removerecipe.toString() !== req.body.recipeID
        );
        // Update the user's savedRecipes with the filtered array
        user.savedRecipes = updatedRecipes;
        // Save the updated user document
        await user.save();
        // Return the updated savedRecipes array
        res.json({ savedRecipes: user.savedRecipes });
    } catch (error) {
        console.log(error);
    }
})

//Now this route is going to show the all recipe that are saved by user

router.get('/savedRecipes/ids/:userID', async (req, res)=>{
    const {page =1, limit =4} = req.query
    try {
        
        const user = await UserModel.findById(req.params.userID);
        res.json({savedRecipes: user?.savedRecipes});
    } catch (error) {
        res.json(error)
    }
})

router.get('/savedRecipes/:userID', async (req, res)=>{
    try {
        const user = await UserModel.findById(req.params.userID);
        const savedRecipes = await RecipeModel.find({_id: {$in: user.savedRecipes}, })
        res.json({savedRecipes});
    } catch (error) {
        res.json(error)
    }
})

export {router as recipesRouter};