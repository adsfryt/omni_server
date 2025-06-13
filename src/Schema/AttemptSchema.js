import mongoose from "mongoose"


const Attempt = new mongoose.Schema({
    answers:[{type: mongoose.Schema.Types.Mixed, required:true}],
    results:[{type: mongoose.Schema.Types.Mixed, required:true}],
    resultsPoint:{type: Number, required:true},
    markQuestions:[{type: mongoose.Schema.Types.Mixed, required:true}],
    questions:[{type: mongoose.Schema.Types.Mixed, required:true}],
    finished:{type:Boolean, required:true},
    user:{type:String, required:true},
    task:{type:String, required:true},
    subject:{type:String, required:true},
    time:{type:Number, required:true},
    startDate:{type:Date, required:true},
    endDate:{type:Date, required:true},
})



export default mongoose.model("Attempt",Attempt)