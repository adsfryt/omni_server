import mongoose from "mongoose"


const Question = new mongoose.Schema({
    data:[{type: mongoose.Schema.Types.Mixed, required:true}],
    tasks:{type: mongoose.Schema.Types.Mixed, required:true},
    type:{type:Number, required:true},
    creator:{type:String, required:true},
    createDate:{type:Date, required:true},
    public:{type:Boolean, required:true},
    subject:{type:String, required:true},
})



export default mongoose.model("Question",Question)