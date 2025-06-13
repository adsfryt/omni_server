import Data from "../../Data.js";
import Subject from "../Schema/SubjectSchema.js";
import FileSystem from "./FileSystem.js";
import mongoose from "mongoose";
import userService from "../service/UserService.js"
import SubjectService from "../service/SubjectService.js"
import MongoService from "../service/MongoService.js";
import User from "../Schema/UserSchema.js";
import UserSchema from "../Schema/UserSchema.js";
import Mongo from "../service/MongoService.js";
import FileService from "../service/FileService.js";
import UserService from "../service/UserService.js";
import fs from "fs";
import SubjectSchema from "../Schema/SubjectSchema.js";


export default new class SubjectAction {

    async create(req,res){
        try{
            let banner = req.files?.banner;
            let data = JSON.parse(req.body.data);
            if(!banner || !data.title || !data.description || !data.students || !(data.accessType === 0 || data.accessType === 1 || data.accessType === 2)){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            if(data.students.includes(res.locals.userId)){
                res.status(400).json({"error":"you can't add yourself on course"});
                return;
            }

            let files = req?.files?.files;
            //console.log(files);
            if(!files){
                files = [];
            }
            if(!Array.isArray(files)){
                files = [files];
            }

            data.description.files = [];
            for (let i = 0; i < files.length; i++) {
                if(files[i].size > 50000000){
                    res.status(400).json({"error":"file's size can't be more than 50mb"});
                    return;
                }

                if(data.description.files.includes(files[i].name)){
                    res.status(400).json({"error":"Names of files can't repeat"});
                    return;
                }
                data.description.files.push(files[i].name);
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

            let path = Data.SubjectFolder+"/"+MongoService.id(NewSubject) +"/description/";
            FileSystem.createPath(path);
            for (let i = 0; i < files.length; i++) {
                await files[i].mv(path + files[i].name);
            }

            FileSystem.createPath(Data.SubjectFolder+"/"+NewSubject["_id"] +"/");
            await banner.mv(Data.SubjectFolder+"/"+NewSubject["_id"] +"/" + banner.name);
            res.json(NewSubject)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't create subject"})
        }
    }


    async update(req,res){
        try{
            let banner = req.files?.banner;
            let data = JSON.parse(req.body.data);
            if(!data.subject){
                res.status(400).json({"error":"incorrect data"});
                return;
            }
            //console.log(banner);

            let OldSubject = await Subject.findById(data.subject);
            if(!OldSubject){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            let UpdateData = {};

            //console.log(data);

            if(data.title){
                UpdateData.title = data.title;
            }
            if(data.description){
                console.log(data.description)
                let files = FileService.filesToArray(req?.files?.files);
                FileService.fillDataFiles(data.description,files)
                let filesArr = OldSubject.description.files;
                let path = Data.SubjectFolder+"/"+data.subject +"/description/";
                FileSystem.createPath(path);
                for (let i = 0; i < data.description.deleteFiles.length; i++) {
                    try{
                        fs.unlinkSync(path + data.description.deleteFiles[i]);
                        var index = filesArr.indexOf(data.description.deleteFiles[i]);
                        if (index > -1) {
                            filesArr.splice(index, 1);
                        }
                    }catch (e) {
                      console.log(e)
                    }
                }
                delete data.description.deleteFiles;
                for (let i = 0; i < files.length; i++) {
                    await files[i].mv(path + files[i].name);
                }
                data.description.files = [...data.description.files,...filesArr];

                UpdateData.description = data.description;
            }
            if(data.users && data.users.length === 2 && data.users[0] instanceof Array && data.users[1] instanceof Array){
                UpdateData.users = data.users;
            }
            if(typeof data.accessType === "number" && ( data.accessType === 0 || data.accessType === 1 || data.accessType === 2)){
                UpdateData.accessType = data.accessType;
            }
            if(banner){
                FileSystem.createPath(Data.SubjectFolder+"/"+ data.subject +"/");
                await banner.mv(Data.SubjectFolder+"/" + data.subject +"/" + banner.name);
                UpdateData.banner = banner.name;
            }

            let NewSubject = await Subject.findByIdAndUpdate(data.subject,UpdateData);
            if(!NewSubject){
                res.status(400).json({"error":"can't update subject"});
                return;
            }
            let students;
            let moderators;
            if(data.users){
               students = SubjectService.fillAddDeleteArray(OldSubject.users[1],data.users[1])
               moderators = SubjectService.fillAddDeleteArray(OldSubject.users[0],data.users[0])
            }
            await UserSchema.updateMany({"userId":{$in:students.deleteArray}},{$pull: {"subscribeSubjects":{ $in: [ data.subject ] } }}, )
            await UserSchema.updateMany({"userId":{$in:students.addArray}},{$push:{subscribeSubjects:data.subject}});

            if(UserService.checkInOwnerList(await UserSchema.findOne({"userId":res.locals.userId}),data.subject)){
                await UserSchema.updateMany({"userId":{$in:moderators.deleteArray}},{$pull: {"moderatorSubjects": {$in: [ data.subject ]} } })
                await UserSchema.updateMany({"userId":{$in:moderators.addArray}},{$push:{moderatorSubjects:data.subject}});
            }

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

    async search(req,res){
        try{
            let {search} = req.body;
            if(!search && typeof search === "string" ){
                res.status(400).json({"error":"incorrect data"});
                return;
            }
            let result = await SubjectSchema.find({"title" : {$regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'$options' : 'i'},accessType: 2});

            res.json(result)
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find subject"})
        }
    }

    async addStudentByUser(req,res){
        try{
            let data = req.body;
            if(!data.subject){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            let Subject = await SubjectSchema.findById(data.subject);
            if(!Subject){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            if(Subject.accessType === 2){
                console.log(res.locals.userId);
                if(!Subject.users[1].includes(res.locals.userId)){
                    console.log(data.subject)
                    let response = await UserSchema.findOneAndUpdate({"userId":res.locals.userId},{$push:{subscribeSubjects : data.subject}});
                    if(!response){
                        res.status(400).json({"error":"can't add to subject"});
                        return;
                    }
                    await SubjectSchema.findByIdAndUpdate({_id:data.subject},{$push:{"users.1":res.locals.userId}});
                }
                res.json({"ok":"true"});
                return;
            }else{
                res.status(400).json({"error":"don't allow"});
                return;
            }

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't create subject"})
        }
    }
}