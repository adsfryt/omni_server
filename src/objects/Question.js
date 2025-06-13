import SubjectSchema from "../Schema/SubjectSchema.js";
import Data from "../../Data.js";
import Mongo from "../service/MongoService.js";
import FileSystem from "./FileSystem.js";
import TaskSchema from "../Schema/TaskSchema.js";
import QuestionSchema from "../Schema/QuestionSchema.js";
import User from "../Schema/UserSchema.js";
import SubjectService from "../service/SubjectService.js";
import QuestionService from "../service/QuestionService.js";
import Question from "../Schema/QuestionSchema.js";
import LectureService from "../service/LectureService.js";
import Lecture from "../Schema/LectureSchema.js";
import FileService from "../service/FileService.js";
import fs from "fs";

export default new class QuestionAction{
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

            switch (data.type) {
                case (0):{
                    data.var.description.files = [];
                    for (let i = 0; i < files.length; i++) {
                        if(files[i].size > 50000000){
                            res.status(400).json({"error":"file's size can't be more than 50mb"});
                            return;
                        }

                        if(data.var.description.files.includes(files[i].name)){
                            res.status(400).json({"error":"Names of files can't repeat"});
                            return;
                        }
                        data.var.description.files.push(files[i].name);
                    }
                    data.var.missCheck = !isNaN(parseFloat(data.var.missCheck)) ? parseFloat(data.var.missCheck) : 0;
                    data.var.extraCheck = !isNaN(parseFloat(data.var.extraCheck)) ? parseFloat(data.var.extraCheck) : 0;
                    data.var.minPoints = !isNaN(parseFloat(data.var.minPoints)) ? parseFloat(data.var.minPoints) : 0;
                    data.var.maxPoints = !isNaN(parseFloat(data.var.maxPoints)) ? parseFloat(data.var.maxPoints) : -1;
                    data.var.minCheck = !isNaN(parseInt(data.var.minCheck)) ? parseInt(data.var.minCheck) : -1;
                    data.var.maxCheck = !isNaN(parseInt(data.var.maxCheck)) ? parseInt(data.var.maxCheck) : -1;

                    let Question = await QuestionSchema.create({
                        creator:res.locals.userId,
                        createDate:new Date(),
                        data:[data.var],
                        public:false,
                        tasks:{},
                        type:0,
                        subject:data.subject
                    })
                    if(!Question){
                        res.status(400).json({"error":"can't create task"});
                        return;
                    }

                    let path = Data.QuestionFolder+"/"+Mongo.id(Question) +"/";
                    FileSystem.createPath(path);
                    for (let i = 0; i < files.length; i++) {
                        await files[i].mv(path + files[i].name);
                    }

                    Subject.questions.push(Mongo.id(Question));
                    await Subject.save();
                    res.json({ok:true})

                    break;
                }
                default: break;
            }

            //console.log(data.data.files);

        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }


    async update(req,res){
        try{
            let data = JSON.parse(req.body.data);
            if(!data.question){
                res.status(400).json({"error":"incorrect data"});
                return;
            }

            let OldQuestion = await QuestionSchema.findById(data.question);
            if(!OldQuestion){
                res.status(400).json({"error":"can't find subject"});
                return;
            }
            let UpdateData = OldQuestion.data[OldQuestion.data.length - 1];

            console.log(data.var);

            switch (OldQuestion.type) {
                case 0:{
                    if(data.var.name){
                        UpdateData.name = data.var.name;
                    }
                    if(data.var.description){
                        let files = FileService.filesToArray(req?.files?.files);
                        FileService.fillDataFiles(data.var.description,files);
                        let filesArr = UpdateData.description.files;
                        let path = Data.QuestionFolder+"/"+data.question +"/";
                        FileSystem.createPath(path);

                        for (let i = 0; i < data.var.description.deleteFiles.length; i++) {
                            var index = filesArr.indexOf(data.var.description.deleteFiles[i]);
                            if (index > -1) {
                                filesArr.splice(index, 1);
                            }
                        }
                        let newArr = [...data.var.description.files,...filesArr];

                        for (let i = 0; i < newArr.length; i++) {

                            if(newArr.indexOf(newArr[i]) !== i){
                                throw new Error("Names of files can't repeat");
                            }
                        }

                        for (let i = 0; i < data.var.description.deleteFiles.length; i++) {
                            try{
                                fs.unlinkSync(path + data.var.description.deleteFiles[i]);
                            }catch (e) {
                                console.log(e)
                            }
                        }
                        delete data.var.description.deleteFiles;
                        for (let i = 0; i < files.length; i++) {
                            await files[i].mv(path + files[i].name);
                        }
                        data.var.description.files = newArr;
                        UpdateData.description = data.var.description;
                    }
                    if(typeof data.var.missCheck === "string"){
                        console.log(",,")
                        UpdateData.missCheck = !isNaN(parseFloat(data.var.missCheck)) ? parseFloat(data.var.missCheck) : 0;
                    }
                    if(typeof data.var.extraCheck=== "string"){
                        UpdateData.extraCheck = !isNaN(parseFloat(data.var.extraCheck)) ? parseFloat(data.var.extraCheck) : 0;
                    }
                    if(typeof data.var.minPoints === "string"){
                        UpdateData.minPoints = !isNaN(parseFloat(data.var.minPoints)) ? parseFloat(data.var.minPoints) : 0;
                    }
                    if(typeof data.var.maxPoints === "string"){
                        UpdateData.maxPoints = !isNaN(parseFloat(data.var.maxPoints)) ? parseFloat(data.var.maxPoints) : -1;
                    }
                    if(typeof data.var.minCheck === "string"){
                        UpdateData.minCheck = !isNaN(parseInt(data.var.minCheck)) ? parseInt(data.var.minCheck) : -1;
                    }
                    if(typeof data.var.maxCheck === "string"){
                        UpdateData.maxCheck = !isNaN(parseInt(data.var.maxCheck)) ? parseInt(data.var.maxCheck) : -1;
                    }

                    if(typeof data.var.mix === "boolean"){
                        UpdateData.mix = data.var.mix;
                    }
                    if(typeof data.var.extraCheckAll === "boolean"){
                        UpdateData.extraCheckAll = data.var.extraCheckAll;
                    }
                    if(typeof data.var.missCheckAll === "boolean"){
                        UpdateData.missCheckAll = data.var.missCheckAll;
                    }
                    if(data.var.options && data.var.options instanceof Array ){
                        let isHaveNecessary = true;
                        for (let i = 0; i < data.var.options.length; i++) {
                            if(!data.var.options[i].text){
                                isHaveNecessary = false;
                                break;
                            }
                        }
                        if(isHaveNecessary){
                            UpdateData.options = data.var.options;
                        }
                    }
                    if(data.var.answer && data.var.answer instanceof Array ){
                        let isHaveNecessary = true;
                        for (let i = 0; i < data.var.answer.length; i++) {
                            if(!(typeof data.var.answer[i].points === "number") || !(typeof data.var.answer[i].check === "boolean")){
                                isHaveNecessary = false;
                                break;
                            }
                        }
                        if(isHaveNecessary){
                            UpdateData.answer = data.var.answer;
                        }
                    }
                    if(data.var.hint && data.var.hint instanceof Array ){
                        let isHaveNecessary = true;
                        for (let i = 0; i < data.var.hint.length; i++) {
                            if(!(typeof data.var.hint[i].points === "number") || !data.var.hint[i].text){
                                isHaveNecessary = false;
                                break;
                            }
                        }
                        if(isHaveNecessary){
                            UpdateData.hint = data.var.hint;
                        }
                    }
                }
            }
            console.log(UpdateData)
            let NewQuestion = await QuestionSchema.findByIdAndUpdate(data.question, {$push:{data:UpdateData}});
            if(!NewQuestion){
                res.status(400).json({"error":"can't update lecture"});
                return;
            }
            res.json(NewQuestion)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't update lecture"})
        }
    }


    async getQuestionsBySubject(req,res){
        try{
            let {subject} = req.body;
            let findInSubscribeSubjects = res.locals.subscribeSubjects.includes(subject);
            let findInPrivelageList = res.locals.mySubjects.includes(subject) || res.locals.moderatorSubjects.includes(subject);
            if( !(findInPrivelageList  || findInSubscribeSubjects )){
                res.status(400).json({"error":"can't find subject"});
                return;
            }

            let Subject = await SubjectSchema.findById(subject);

            let arrayQuestions = await QuestionService.getQuestionsByIds(Subject.questions,false);
            //console.log(arrayLectures)
            let result = QuestionService.filter(arrayQuestions,!findInPrivelageList,false);

            //console.log(response);
            res.json(result)
            return;
        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find subject"})
        }
    }

    async getQuestionsByIds(req,res){
        try{
            let array = req.body;

            let arrayQuestions = await QuestionService.getQuestionsByIds(array,true);
            let newQuestions = QuestionService.filterDynamic(res.locals,arrayQuestions,true)

            //console.log(response);
            res.json(newQuestions)

        }catch (e) {
            console.log(e)
            res.status(400).json({"error":"can't find questions"})
        }
    }
}