import Data from "../../Data.js";
import Subject from "../Schema/SubjectSchema.js";
import FileSystem from "./FileSystem.js";
import mongoose from "mongoose";
import userService from "../service/UserService.js"
import SubjectService from "../service/SubjectService.js"
import MongoService from "../service/MongoService.js";
import User from "../Schema/UserSchema.js";
import UserSchema from "../Schema/UserSchema.js";
export default new class SubjectAction {

    async create(req,res){
        try{
            let {banner} = req.files;
            let data = JSON.parse(req.body.data);
            if(!data.title || !data.description || !data.students || !(data.accessType === 0 || data.accessType === 1 || data.accessType === 2)){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            if(data.students.includes(res.locals.userId)){
                res.status(400).json({"error":"you can't add yourself on course"});
                return;
            }

            let NewSubject = await Subject.create({
                title:data.title,
                description:data.description,
                users:[[],data.students],
                accessType:data.accessType, //0 приватный 1 ссылка 2 общедоступный
                createDate:Date.now(),
                owner:res.locals.userId,
                lectures:[],
                tasks:[],
                banner: banner.name
            });
            if(!NewSubject){
                res.status(400).json({"error":"can't create subject"});
                return;
            }

            await userService.addOwnerSubject(res.locals.userId,MongoService.id(NewSubject));

            await UserSchema.updateMany({"userId":{$in:data.students}},{$push:{subscribeSubjects:MongoService.id(NewSubject)}})

            FileSystem.createPath(Data.SubjectFolder+"/"+NewSubject["_id"] +"/");
            await banner.mv(Data.SubjectFolder+"/"+NewSubject["_id"] +"/" + banner.name);
            res.json(NewSubject)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't create subject"})
        }
    }
    async getSubjectsByAuthUser(req,res){
        try{
            // let array = [];
            // for (let i = 0; i < arraySubjects.length; i++) {
            //     let response = await Subject.findById(arraySubjects[i]);
            //     array.push(response);
            // }

            let user = await User.findOne({"userId":res.locals.userId});

            let arrayMy = await SubjectService.getSubjectsByIds(user.mySubjects,false);
            let arrayMod = await SubjectService.getSubjectsByIds(user.moderatorSubjects,false);
            let arrayStud = await SubjectService.getSubjectsByIds(user.subscribeSubjects,false);
            // arrayStud.map((key)=>{
            //     key.users = undefined;
            // });
            //console.log(response);
            res.json([arrayMy,arrayMod, arrayStud])
            return;
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find subject"})
        }
    }
    async getSubjectsByIds(req,res){
        try{
            // let array = [];
            // for (let i = 0; i < arraySubjects.length; i++) {
            //     let response = await Subject.findById(arraySubjects[i]);
            //     array.push(response);
            // }

            let user = await User.findOne({"userId":res.locals.userId});

            let array = req.body;
            array.map((key)=>{
                if( !(user.mySubjects.includes(key) || user.moderatorSubjects.includes(key) || user.subscribeSubjects.includes(key)) ){
                    key = "F";
                }
            });

            let arrayMy = await SubjectService.getSubjectsByIds(array);
            // arrayMy.map((key)=>{
            //     if(!(user.mySubjects.includes(key) || user.moderatorSubjects.includes(key))){
            //         key.users = undefined;
            //     }
            // });
            //console.log(response);
            res.json(arrayMy)
            return;
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find subject"})
        }
    }

}