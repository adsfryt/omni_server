import mongoose from "mongoose"


const User = new mongoose.Schema({
    email:{type:String, required:false},
    login:{type:String, unique:true, required:true},
    userId:{type:String, required:true},
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    patronymic:{type:String, required:true},
    subscribeSubjects:[{type: mongoose.Schema.Types.Mixed, required:true}],
    mySubjects:[{type: mongoose.Schema.Types.Mixed, required:true}],
    moderatorSubjects:[{type: mongoose.Schema.Types.Mixed, required:true}],
    method:{type:String, required:true},
    refreshTokenService:{type:String, required:true},
    accessTokenService:{type:String, required:true},
    refreshToken:[{type: mongoose.Schema.Types.Mixed}] ,
    code:{type:String, required:true},
    codeExpireDate:{type:Date, required:true},
})



export default mongoose.model("User",User)