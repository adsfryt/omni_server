import Data from "../../Data.js";
import SubjectSchema from "../Schema/SubjectSchema.js";
import fs from "fs";
import LectureSchema from "../Schema/LectureSchema.js";
import LectureService from "../service/LectureService.js";
import TaskSchema from "../Schema/TaskSchema.js";
import TaskService from "../service/TaskService.js";


export default new class FileAction{
    async getBanner(req,res){
        try{
            let {subject} = req.query;

            if(!subject){
                res.status(400).json({"error":"invalid input data"});
                return;
            }
            let Subject = await SubjectSchema.findById(subject);
            let path = Data.SubjectFolder + subject + "/"+Subject.banner;
            console.log(path)
            if(!fs.existsSync(path)){
                res.status(400).json({"error":"can't find banner"});
                return;
            }
            return res.download(path);

        }catch (e) {
            res.status(400).json({"error":"something happened"});
            console.log(e)
        }
    }

    async getLecture(req,res){
        try{

            let {lecture,  name} = req.query;

            if(!(lecture && name)){
                res.status(400).json({"error":"invalid input data"});
                return;
            }

            let Lecture = await LectureSchema.findById(lecture);
            let Subject = await SubjectSchema.findById(Lecture.subject);

            let allowAsStudent =  LectureService.filterBoolean(res.locals,Lecture);

            if(!(allowAsStudent )){
                res.status(400).json({"error":"not allow"});
                return;
            }
            let path = Data.LectureFolder + lecture + "/"+ name;
            if(!fs.existsSync(path)){
                res.status(400).json({"error":"can't find file"});
                return;
            }
            return res.download(path);

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"something happened"});
        }
    }

    async getTask(req,res){
        try{

            let {task,  name} = req.query;

            if(!(task && name)){
                res.status(400).json({"error":"invalid input data"});
                return;
            }

            let Task = await TaskSchema.findById(task);
            let Subject = await SubjectSchema.findById(Task.subject);

            let allowAsStudent =  TaskService.filterBoolean(res.locals,Task);

            if(!(allowAsStudent )){
                res.status(400).json({"error":"not allow"});
                return;
            }
            let path = Data.TaskFolder + task + "/"+ name;
            if(!fs.existsSync(path)){
                res.status(400).json({"error":"can't find file"});
                return;
            }
            return res.download(path);

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"something happened"});
        }
    }

}