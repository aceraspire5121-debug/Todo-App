import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"  // it will load all the environment variables inside process.env, so that we can take them into variables and can use them in our code and out port,connection,JWT_SECRET remains secure and hidden
dotenv.config();
const app = express()
const port =process.env.PORT;
const MONGO_URL=process.env.MONGO_URL
const JWT_SECRET=process.env.JWT_SECRET 

app.use(express.json()); // Your frontend sends JSON as a string("{ text: 'Buy Milk', completed: false }"), and express.json() converts it into a usable JavaScript object inside backend({ text: "Buy Milk", completed: false }) , it is a built in middleware like app.use(express.static)
app.use(express.static('./code')); 
import {Todo} from "./models/add.js"
import { user } from "./models/user.js";
let conn=await mongoose.connect(MONGO_URL)

// Agar app.use(auth) laga doge, to har request middleware se guzrega, matlab /login aur /register bhi. Aur user ke paas token nahi hoga, to sabhi requests fail ho jaayengi.

// Isliye route-specific middleware hi sahi hai. Sirf un routes pe lagao jahan authentication zaruri hai, jaise: /getting, /tasks, /update, /checkup, /dele.

function auth(req,res,next){ // route specific middleware hai jo ki chalega jab ham chahenge tab
const token = req.headers["authorization"];
if(!token)
  return res.status(401).json({ message: "No token" });
try{
  const decoded=jwt.verify(token,JWT_SECRET)
  req.userId=decoded.id;
  next()
}catch(err)
{
   res.status(401).json({ message: "Invalid token" });
}
}

app.get('/getting', auth, async(req, res) => {
  try{
  const data=await Todo.find({user:req.userId}) // it will find all the documents associated with the user who has logged in, since on his login , he will get a token, through that token varification, req.userID is generated for that user so his documents contains specific userID which is different from other users and no one can access themm
  res.json(data)
  }
catch(err)
{
  console.log(err)
   res.status(500).json({ error: "Failed to fetch tasks" }); // Send error response
}

})
app.post('/tasks', auth, async (req, res) => {
  const data=await Todo.create({...req.body,user:req.userId}) // jab data create ho jayega to uske baad jo document banta hai bo return karta hai mongodb and bo jata hai data me fir bapas fontend ke passs
//hame jab sath me middleware bala lagana ho to hame req.body ko open karna hoga iske liye ...req.body ka use karenge

  res.json(data) //res.json() automatically does two things:
                // Converts the JS object (data) → JSON string
                //Sets the HTTP header Content-Type: application/json
})
app.delete('/dele',auth, async (req, res) => {
  try{
    const {id}=req.body; // req.body=>{id:567866} so we using destructuirng i.e when obj={a:2} we can write const {a}=obj
  const data=await Todo.deleteOne({id,user: req.userId})
  const newdata=await Todo.find({user:req.userId}) //req.userID means user ki document id aur bahi uske respective tasks me user: me stored hai
  res.json(newdata)
  }catch(err){
    console.log(err)
   res.status(500).json({ error: "Failed to fetch mongo" }); // Send error response
  }
})
app.put('/update', auth, async (req, res) => {
  try{
    const id=req.body.id; // req.body=>{id:567866} so we using destructuirng i.e when obj={a:2} we can write const {a}=obj
  const data=await Todo.findOneAndUpdate({id:id,user:req.userId},{$set:{text:req.body.new}},{new:true}) // without new:true , findOneandupdateone returns the old documetn, with it ,it returns the new updated document
  res.json(data)
  }catch(err){
    console.log(err)
   res.status(500).json({ error: "Failed to fetch mongo" }); // Send error response
  }
})
app.put('/checkup', auth, async (req, res) => {
  try{
    const id=req.body.id; // req.body=>{id:567866} so we using destructuirng i.e when obj={a:2} we can write const {a}=obj
  const data=await Todo.findOneAndUpdate({id:id,user: req.userId},{$set:{completed:req.body.bool}},{new:true}) // without new:true , findOneandupdateone returns the old documetn, with it ,it returns the new updated document
  res.json(data)
  }catch(err){
    console.log(err)
   res.status(500).json({ error: "Failed to fetch mongo" }); // Send error response
  }
})

app.post('/login', async (req, res) => {
  try{
  const {username,password}=req.body;
  const Existuser=await user.findOne({username}) // or you can write {username:username} , here firt checking for username, fir return karega poora document jo match kia bo
  if(!Existuser)
    return res.json({success:false,message:"Account not found"});
  const isMatch=await bcrypt.compare(password,Existuser.password);
  if(!isMatch) 
    return res.json({success:false,message:"Wrong Password"}) // agar password galat hoga to uska message

  const token = jwt.sign({ id: Existuser._id }, JWT_SECRET, { expiresIn: "7d" }); // maine apna signature add kara hai har token me JWT_SECRET SE
res.json({success:true,token})
  }catch(err){
    console.log(err)
     res.status(500).json({ message: "Server error" });
  }
})

app.post('/register', async (req, res) => {
  try{
    const {username,password}=req.body;
    const userExist=await user.findOne({username}) 
    if(userExist) // if object is there then true or for empty object , it is false
      return res.json({success:false,message:"User already exists"})
     const hashedPassword = await bcrypt.hash(password, 10); // password ke encryption ki process 10 bar repeat karo

     const newuser=await user.create({username,password:hashedPassword})
     res.json({success:true,message:"Account created successfully"})
  }catch(err)
  {
    console.log(err);
        res.json({ success: false, message: "Username already exists" });
  }

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// Tum ek hi JWT_SECRET define karoge backend me.(ye mera signature hai har token me , jab bhi koi request aayegi to mai us user ke token me apna signature verify karunga middleware me , if my signature is there then its a valid token else its not a valid token and do not send request into route handlers for changing purpose)

// Jab koi user login karega, backend us user ka unique _id lekar jwt.sign() karega aur ek unique token generate karega.

// Token har user ke liye alag hoga, kyunki payload (id: user._id) har user ke liye different hai.

// Browser me token store hoga (localStorage) aur har request me backend ko bheja jaayega for authentication.

// Secret key ka kaam sirf token ko sign aur verify karne ka hai — user-specific uniqueness token ke payload se aati hai, secret se nahi.  

// LOCALSTORAGE ME DATA STORE HOTA HAI US BROWSER PAR JAHA AAPNE LOGIN KARA, TO AGAR DEVICE CHANGE,BROWSER CHANGE YOU WILL NOT GET YOUR DATA, SINCE IT IS STORING ON THE SPECIFIC BROWSER

// MONGODB LOCAL STORES DATA LOCALLY ON YOUR COMPUTER WHERE EXPRESS.JS SERVER IS RUNNING, IN THISYOU CAN ACCESS DATA THROGH ANY BROWSER, YPU WILL GET DATA, MULTIUSER CAN ALSO WORK WITH THEIR RESPECTIVE DATA ON THE SAME DEVICE SINCE DATA IS STORING LOCALLY, IN ANY OTHER DEVICE YOU WILL NOT GETA SINCE OTHER DEVICE CANT CONNECT WITH YOUR LOCAL STORAGE

// MONGODB ATLAS PAR DATA CLOUD PAR STORE HOTA HAI TO VALID USER KISI BHI DEVICE SE KISI BHI BROWSER PAR DATA KO FETCH KAR SKTA HAI, ISLIYE HOSTING ME HAM YE USE KARTE HAI