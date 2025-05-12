import mongoose from "mongoose"


const Subject = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type: mongoose.Schema.Types.Mixed, required:true},
    owner:{type:String, required:true},
    createDate:{type:Date, required:true},
    accessType:{type:Number, required:true},
    users:[{type: mongoose.Schema.Types.Mixed, required:true}],
    lectures:[{type: mongoose.Schema.Types.Mixed, required:true}],
    questions:[{type: mongoose.Schema.Types.Mixed, required:true}],
    tasks:[{type: mongoose.Schema.Types.Mixed, required:true}],
    banner:{type:String, required:true},
})



export default mongoose.model("Subject",Subject)