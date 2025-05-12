import SubjectSchema from "../Schema/SubjectSchema.js";
import Task from "../Schema/TaskSchema.js";
import Data from "../../Data.js";
import Mongo from "../service/MongoService.js";
import FileSystem from "./FileSystem.js";
import TaskSchema from "../Schema/TaskSchema.js";
import QuestionSchema from "../Schema/QuestionSchema.js";
import TaskService from "../service/TaskService.js";
import LectureService from "../service/LectureService.js";

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