import FileSystem from "./FileSystem.js";
import SubjectSchema from "../Schema/SubjectSchema.js";
import TaskSchema from "../Schema/TaskSchema.js";
import Mongo from "../service/MongoService.js";
import QuestionSchema from "../Schema/QuestionSchema.js";
import Data from "../../Data.js";
import mongoose from "mongoose";
import AttemptSchema from "../Schema/AttemptSchema.js";
import TaskService from "../service/TaskService.js";
import QuestionService from "../service/QuestionService.js";
import UserService from "../service/UserService.js";
import questionSchema from "../Schema/QuestionSchema.js";
import questionService from "../service/QuestionService.js";
import AttemptService from "../service/AttemptService.js";


export default new class AttemptAction {

    async create(req,res){
        try {
            let {task} = req.body;
            if(!task){
                res.status(400).json({"error":"can't find task's id"});
                return;
            }

            let Task = await TaskSchema.findById(task);
            if(!Task){
                res.status(400).json({"error":"can't find task by id"});
                return;
            }

            if(!TaskService.filterBoolean(res.locals,Task) || !(Date.now() > (Task.startDate) && Date.now() < (Task.endDate))){
                res.status(400).json({"error":"don't allow"});
                return;
            }
            //console.log(data.data.files);
            let ActiveAttempt = await AttemptSchema.findOne({user:res.locals.userId, task:task, finished:false});
            if(ActiveAttempt){
                res.status(400).json({"error":"you have active attempt"});
                return;
            }

            let AllAttempts = await AttemptSchema.find({user:res.locals.userId, task:task});
            if(AllAttempts.length >= Task.attempt ){
                res.status(400).json({"error":"you waste all attempts"});
                return;
            }

            if(!UserService.checkInSubscribeList(res.locals,Task.subject)){
                res.status(400).json({"error":"you should subscribe on subject"});
                return;
            }
            let Questions = await QuestionService.getQuestionsByIds(Task.data.questions)
            let tQuestions = [];
            let tAnswers = [];
            for (let i = 0; i < Questions.length; i++) {
                if(!Questions[i]){
                    res.status(400).json({"error":"something going wrong"});
                    return;
                }
                tAnswers.push(AttemptService.CreateEmptyResultQuestion(Questions[i],Questions[i].data.length-1));
                tQuestions.push([i,Questions[i].data.length-1]);
            }
            let Attempt = await AttemptSchema.create({
                answers:tAnswers,
                results:new Array(Task.data.questions.length).fill(0),
                questions:tQuestions,
                markQuestions:[],
                finished:false,
                user:res.locals.userId,
                task:task,
                subject:Task.subject,
                startDate:Date.now(),
                endDate:-1,
            })
            if(!Attempt){
                res.status(400).json({"error":"can't create attempt"});
                return;
            }
            res.json(Attempt)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    //student
    async getAttemptsInTaskByAuthUser(req,res){
        try {
            let {task} = req.body;
            if(!task){
                res.status(400).json({"error":"can't find task's id"});
                return;
            }

            let Task = await TaskSchema.findById(task);
            if(!Task){
                res.status(400).json({"error":"can't find task by id"});
                return;
            }

            if(!TaskService.filterBoolean(res.locals,Task) ){
                res.status(400).json({"error":"not allow"});
                return;
            }

            if(!UserService.checkInSubscribeList(res.locals,Task.subject)){
                res.status(400).json({"error":"you should be a student"});
                return;
            }
            let AllAttempts = await AttemptSchema.find({user:res.locals.userId, task:task});

            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getAttemptsInSubjectByAuthUser(req,res){
        try {
            let {subject} = req.body;
            if(!task){
                res.status(400).json({"error":"can't find task's id"});
                return;
            }

            if(!UserService.checkInSubscribeList(res.locals,subject)){
                res.status(400).json({"error":"you should be a student"});
                return;
            }

            let AllAttempts = await AttemptSchema.find({ subject:subject, user:res.locals.userId});

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    //moderator
    async getAttemptsByTask(req,res){
        try {
            let {task} = req.body;
            if(!task){
                res.status(400).json({"error":"can't find task's id"});
                return;
            }

            let Task = await TaskSchema.findById(task);
            if(!Task){
                res.status(400).json({"error":"can't find task by id"});
                return;
            }

            let AllAttempts;

            if(UserService.checkInPrivelageList(res.locals,Task.subject)){
                AllAttempts = await AttemptSchema.find({ task:task});
            }else{
                res.status(400).json({"error":"not allow"});
                return;
            }
            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getAttemptsByUser(req,res){
        try {
            let {user,subject} = req.body;
            if(!user || !subject){
                res.status(400).json({"error":"can't find task's or subject's id"});
                return;
            }

            let AllAttempts;

            if(UserService.checkInPrivelageList(res.locals,subject)){
                AllAttempts = await AttemptSchema.find({user:user, subject:subject});
            }else{
                res.status(400).json({"error":"don't allow"});
                return;
            }
            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getAttemptsBySubject(req,res){
        try {
            let {subject} = req.body;
            if(!subject){
                res.status(400).json({"error":"can't find subject's id"});
                return;
            }

            let AllAttempts;

            if(UserService.checkInPrivelageList(res.locals,subject)){
                AllAttempts = await AttemptSchema.find({subject:subject});
            }else{
                res.status(400).json({"error":"don't allow"});
                return;
            }
            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getAttemptsInTaskByUser(req,res){
        try {
            let {user,task} = req.body;
            if(!user || !task){
                res.status(400).json({"error":"can't find task's or subject's id"});
                return;
            }

            let Task = await TaskSchema.findById(task);
            if(!Task){
                res.status(400).json({"error":"can't find task by id"});
                return;
            }

            let AllAttempts;

            if(UserService.checkInPrivelageList(res.locals,Task.subject)){
                AllAttempts = await AttemptSchema.find({user:user, task:task});
            }else{
                res.status(400).json({"error":"don't allow"});
                return;
            }
            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getAttemptById(req,res){
        try {
            let {attempt} = req.body;
            if(!attempt){
                res.status(400).json({"error":"can't find attempt's id"});
                return;
            }
            let Attempt = await AttemptSchema.findById(attempt);
            if(!Attempt){
                res.status(400).json({"error":"can't find attempt by id"});
                return;
            }

            if(UserService.checkInPrivelageList(res.locals,Attempt.subject)){
                res.json(Attempt);
                return;
            } else if(UserService.checkInSubscribeList(res.locals,Attempt.subject)){
                if(Attempt.user === res.locals.userId){
                    res.json(Attempt);
                    return;
                }else{
                    res.status(400).json({"error":"not allow"});
                    return;
                }
            }

            res.status(400).json({"error":"not allow"});

            //console.log(data.data.files);

        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }
    async getActiveAttemptsBySubject(req,res){
        try {
            let {subject} = req.body;
            if(!subject){
                res.status(400).json({"error":"can't find subject's id"});
                return;
            }

            let AllAttempts;

            if(UserService.checkInPrivelageList(res.locals,subject)){
                AllAttempts = await AttemptSchema.find({subject:subject,finished: false});
            }else{
                res.status(400).json({"error":"don't allow"});
                return;
            }
            //console.log(data.data.files);

            res.json(AllAttempts)
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }

    async getAttemptQuestions(req,res){
        try {
            let {attempt} = req.body;
            if(!attempt) {
                res.status(400).json({"error": "can't find attempt's id"});
                return;
            }

            let Attempt = await AttemptSchema.findById(attempt);
            if(!Attempt){
                res.status(400).json({"error":"can't find attempt by id"});
                return;
            }

            let Task = await TaskSchema.findById(Attempt.task);
            if(!Task){
                res.status(400).json({"error":"can't find task"});
                return;
            }

            let AllQuestions = await questionService.getQuestionsByIds( Attempt.questions.map((key)=>{return Task.data.questions[key[0]]}));

            if(UserService.checkInPrivelageList(res.locals, Attempt.subject)){
                res.json(AllQuestions)
                return;
            }else if (UserService.checkInSubscribeList(res.locals, Attempt.subject)){
                for (let i = 0; i < AllQuestions.length; i++) {
                    questionService.toPublicPresent(AllQuestions[i]);
                }
                res.json(AllQuestions)
                return;
            }
            //console.log(data.data.files);

            res.status(400).json({"error":"not allow"});
        }catch (e) {
            res.status(400).json({"error":"something going wrong"});
            console.log(e)
        }
    }


}