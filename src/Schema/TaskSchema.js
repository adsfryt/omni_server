import mongoose from "mongoose"

const Task = new mongoose.Schema({
    title:{type:String, required:true},
    data:{type: mongoose.Schema.Types.Mixed, required:true},
    creator:{type:String, required:true},
    startDate:{type:Date, required:true},
    endDate:{type:Date, required:true},
    createDate:{type:Date, required:true},
    active:{type:Boolean, required:true},
    users:[{type: String, required:true}],
    allUsers:{type:Boolean, required:true},
    spot:{type:Boolean, required:true},
    mix:{type:Boolean, required:true},
    attempt:{type: Number, required:true},
    time:{type:Number, required:true},
    showAnswer:{type:Number, required:true},
    customSettings:{type: mongoose.Schema.Types.Mixed, required:true},
    script:{type: String},
    showResult:{type: Number, required:true},
    subject:{type:String, required:true},
})

export default mongoose.model("Task",Task)