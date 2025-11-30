import mongoose from "mongoose"
import { type } from "os";
const TodoSchema = new mongoose.Schema({
     text:{type:String,required:true},
     id:{type:Number,required:true},
     completed:{type:Boolean,default:false},
      user:{type:String}
});

export const Todo = mongoose.model('Todo', TodoSchema);