const express = require("express")
const mongoose = require("mongoose")
const {userRouter} = require("./Routes/user");
const {router} = require("./Routes/resume");
const practiceRouter = require("./Routes/practice");
const interviewRouter = require("./Routes/interview");

const app = express();
const cors = require("cors");

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}));

app.use(express.json());


app.use("/",userRouter); 
app.use("/user",router);
app.use("/interviews",interviewRouter);
app.use("/api",practiceRouter);

async function main(){
    await mongoose.connect("mongodb+srv://aryanchhabra18104:Kt3EVxFrVO96flHw@cluster0.auu73.mongodb.net/interview").then(()=>{
        console.log("database connected");
        app.listen(3000,function(){
            console.log("Server is listening on port 3000")
        })
    }).catch((err)=>{
        console.log(err);
    })
    
}

main()