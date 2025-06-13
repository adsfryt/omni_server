import Data from "../../Data.js";
import mongoose from "mongoose";
import SubjectSchema from "../Schema/SubjectSchema.js";
import Lecture from "../Schema/LectureSchema.js";
import Mongo from "../service/MongoService.js";
import FileSystem from "./FileSystem.js";
import User from "../Schema/UserSchema.js";
import SubjectService from "../service/SubjectService.js";
import LectureService from "../service/LectureService.js";
import FileService from "../service/FileService.js";
import Subject from "../Schema/SubjectSchema.js";
import fs from "fs";
import UserSchema from "../Schema/UserSchema.js";
import UserService from "../service/UserService.js";


export default new class LectureAction {
    async create(req,res){
        try {
            let data = JSON.parse(req.body.data);
            let files = req?.files?.files;
            //console.log(files);
            if(!files){
                files = [];
            }
            if(!Array.isArray(files)){
                files = [files];
            }
            //console.log(files);

            let Subject = await SubjectSchema.findById(data.subject);
            if(!Subject){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            if(files.length > 10){
                res.status(400).json({"error":"amount of files can't be more than 10"});
                return;
            }

            data.data.files = [];
            for (let i = 0; i < files.length; i++) {
                if(files[i].size > 50000000){
                    res.status(400).json({"error":"file's size can't be more than 50mb"});
                    return;
                }

                if(data.data.files.includes(files[i].name)){
                    res.status(400).json({"error":"Names of files can't repeat"});
                    return;
                }
                data.data.files.push(files[i].name);
            }
            //console.log(data.data.files);
            let Lectures = await Lecture.create({
                creator:res.locals.userId,
                createDate:new Date(),
                title:data.title,
                data:data.data,
                active:data.active,
                users:data.users,
                allUsers:data.allUsers,
                subject:data.subject
            })
            if(!Lectures){
                res.status(400).json({"error":"can't create lecture"});
                return;
            }

            let path = Data.LectureFolder+"/"+Mongo.id(Lectures) +"/";
            FileSystem.createPath(path);
            for (let i = 0; i < files.length; i++) {
                await files[i].mv(path + files[i].name);
            }

            Subject.lectures.push(Mongo.id(Lectures));
            await Subject.save();
            res.json({ok:true})
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }

    async update(req,res){
        try{
            let data = JSON.parse(req.body.data);
            if(!data.lecture){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            let OldLecture = await Lecture.findById(data.lecture);
            if(!OldLecture){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            let UpdateData = {};

            //console.log(data);

            if(data.title){
                UpdateData.title = data.title;
            }
            if(data.data){
                let files = FileService.filesToArray(req?.files?.files);
                FileService.fillDataFiles(data.data,files);
                let filesArr = OldLecture.data.files;
                let path = Data.LectureFolder+"/"+data.lecture +"/";
                FileSystem.createPath(path);
                for (let i = 0; i < data.data.deleteFiles.length; i++) {
                    try{
                        var index = filesArr.indexOf(data.data.deleteFiles[i]);
                        if (index > -1) {
                            filesArr.splice(index, 1);
                        }
                        fs.unlinkSync(path + data.data.deleteFiles[i]);
                    }catch (e) {
                        console.log(e)
                    }
                }
                delete data.data.deleteFiles;
                for (let i = 0; i < files.length; i++) {
                    await files[i].mv(path + files[i].name);
                }
                data.data.files = [...data.data.files,...filesArr];
                UpdateData.data = data.data;
            }
            if(data.users && data.users instanceof Array ){
                UpdateData.users = data.users;
            }
            console.log(data.allUsers,data.active)
            if(typeof data.allUsers === "boolean"){
                UpdateData.allUsers = data.allUsers;
            }
            if(typeof data.active === "boolean"){
                UpdateData.active = data.active;
            }

            let NewLecture = await Lecture.findByIdAndUpdate(data.lecture,UpdateData);
            if(!NewLecture){
                res.status(400).json({"error":"can't update lecture"});
                return;
            }

            res.json(NewLecture)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't update lecture"})
        }
    }

    async getLecturesBySubject(req,res){
        try{
            let {subject} = req.body;
            let findInSubscribeSubjects = res.locals.subscribeSubjects.includes(subject);
            let findInPrivelageList = res.locals.mySubjects.includes(subject) || res.locals.moderatorSubjects.includes(subject);
            if( !(findInPrivelageList  || findInSubscribeSubjects )){
                res.status(400).json({"error":"can't find subject"});
                return;
            }

            let Subject = await  SubjectSchema.findById(subject);

            let arrayLectures = await LectureService.getLecturesByIds(Subject.lectures,false);
            //console.log(arrayLectures)
            let result = LectureService.filter(res.locals,arrayLectures,!findInPrivelageList, findInSubscribeSubjects, false);
            //console.log(result)
            //console.log(response);
            res.json(result)
            return;
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find lecture"})
        }
    }

    async getLecturesByIds(req,res){
        try{
            let array = req.body;

            let arrayLectures = await LectureService.getLecturesByIds(array,true);
            let newLectures = LectureService.filterDynamic(res.locals,arrayLectures,true)

            //console.log(response);
            res.json(newLectures)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find lecture"})
        }
    }
}