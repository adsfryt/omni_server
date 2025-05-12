import mongoose from "mongoose"


const Lecture = new mongoose.Schema({
    title:{type:String, required:true},
    data:{type: mongoose.Schema.Types.Mixed, required:true},
    creator:{type:String, required:true},
    createDate:{type:Date, required:true},
    active:{type:Boolean, required:true},
    users:[{type: String, required:true}],
    allUsers:{type:Boolean, required:true},
    subject:{type:String, required:true},
})



export default mongoose.model("Lecture",Lecture)