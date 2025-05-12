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