import SubjectSchema from "../Schema/SubjectSchema.js";
import Task from "../Schema/TaskSchema.js";
import Data from "../../Data.js";
import Mongo from "../service/MongoService.js";
import FileSystem from "./FileSystem.js";
import TaskSchema from "../Schema/TaskSchema.js";
import QuestionSchema from "../Schema/QuestionSchema.js";
import TaskService from "../service/TaskService.js";
import LectureService from "../service/LectureService.js";
import Lecture from "../Schema/LectureSchema.js";
import FileService from "../service/FileService.js";
import fs from "fs";
import AttemptSchema from "../Schema/AttemptSchema.js";

export default new class TaskAction{
    async create(req,res){
        try {
            let data = JSON.parse(req.body.data);
            let files = FileSystem.toArray(req?.files?.files);

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
            let Task = await TaskSchema.create({
                creator:res.locals.userId,
                createDate:new Date(),
                startDate:data.startDate,
                endDate:data.endDate,
                title:data.title,
                time:data.time,
                attempt:data.attempt,
                script:data.script,
                customSettings:data.customSettings,
                data:data.data,
                active:data.active,
                users:data.users,
                mix:data.mix,
                showResult:data.showResult,
                showAnswer:data.showAnswer,
                spot:data.spot,
                allUsers:data.allUsers,
                subject:data.subject
            })
            if(!Task){
                res.status(400).json({"error":"can't create task"});
                return;
            }
            let follow = "tasks." + Mongo.id(Task);
            for (let i = 0; i < data.data.questions.length; i++) {
                let resUpdateQuestion = await QuestionSchema.updateMany( { _id: data.data.questions[i] }, {   $inc: { [follow] : 1} });
                if(!resUpdateQuestion){
                    res.status(400).json({"error":"can't create task"});
                    return;
                }
            }

            let path = Data.TaskFolder+"/"+Mongo.id(Task) +"/";
            FileSystem.createPath(path);
            for (let i = 0; i < files.length; i++) {
                await files[i].mv(path + files[i].name);
            }

            Subject.tasks.push(Mongo.id(Task));
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
            console.log(data)
            if(!data.task){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            let OldTask = await TaskSchema.findById(data.task);
            if(!OldTask){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            let UpdateData = {};

            let Attempt = await AttemptSchema.findOne({ task:data.task});
            if((Attempt)){
                res.status(400).json({"error":"attempts are exist for this task"});
                return;
            }

            if(data.title){
                UpdateData.title = data.title;
            }
            if(data.data && data.data.text && data.data.editor && data.data.questions && (data.data.questions instanceof Array) && data.data.deleteFiles && (data.data.deleteFiles instanceof Array)){

                let files = FileService.filesToArray(req?.files?.files);
                FileService.fillDataFiles(data.data,files);
                let filesArr =  OldTask.data.files;
                let path = Data.TaskFolder+"/"+data.task +"/";
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
            if(typeof data.allUsers === "boolean"){
                UpdateData.allUsers = data.allUsers;
            }
            if(typeof data.active === "boolean"){
                UpdateData.active = data.active;
            }
            if(typeof data.mix === "boolean"){
                UpdateData.mix = data.mix;
            }
            if(typeof data.attempt === "number"){
                UpdateData.attempt = data.attempt;
            }
            if(typeof data.time === "number"){
                UpdateData.time = data.time;
            }
            if(data.script){
                UpdateData.script = data.script;
            }
            if(typeof data.startDate === "number"){
                UpdateData.startDate = data.startDate;
            }
            if(typeof data.endDate === "number"){
                UpdateData.endDate = data.endDate;
            }
            if(typeof data.showAnswer === "number"){
                UpdateData.showAnswer = data.showAnswer;
            }
            if(typeof data.showResult === "number"){
                UpdateData.showResult = data.showResult;
            }
            if(typeof data.spot === "boolean"){
                UpdateData.spot = data.spot;
            }

            let NewLecture = await TaskSchema.findByIdAndUpdate(data.task,UpdateData);
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


    async getTasksBySubject(req,res){
        try{
            let {subject} = req.body;
            let findInSubscribeSubjects = res.locals.subscribeSubjects.includes(subject);
            let findInPrivelageList = res.locals.mySubjects.includes(subject) || res.locals.moderatorSubjects.includes(subject);
            if( !(findInPrivelageList  || findInSubscribeSubjects )){
                res.status(400).json({"error":"can't find subject"});
                return;
            }

            let Subject = await  SubjectSchema.findById(subject);
            let arrayTasks = await TaskService.getTasksByIds(Subject.tasks,false);
            //console.log(arrayTasks)
            let result = TaskService.filter(res.locals,arrayTasks,!findInPrivelageList, findInSubscribeSubjects, false);

            //console.log(response);
            res.json(result)
            return;
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find task"})
        }
    }

    async getTasksByIds(req,res){
        try{
            let array = req.body;
            let arrayTasks = await TaskService.getTasksByIds(array,true);
            let newTasks = TaskService.filterDynamic(res.locals,arrayTasks,true)

            //console.log(response);
            res.json(newTasks)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find tasks"})
        }
    }


}