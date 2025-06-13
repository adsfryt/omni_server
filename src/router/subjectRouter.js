import {Router} from "express";
import userAction from "../objects/User.js";
import subjectAction from "../objects/Subject.js";
import User from "../objects/User.js";

let subjectRouter = new Router();
subjectRouter.post('/create',userAction.middleware, subjectAction.create);
subjectRouter.post('/update',User.middleware,subjectAction.update);
subjectRouter.post('/search',subjectAction.search);
subjectRouter.post('/addStudentByUser',User.middleware,subjectAction.addStudentByUser)
subjectRouter.get('/getSubjectsByAuthUser',userAction.middleware, subjectAction.getSubjectsByAuthUser);
subjectRouter.post('/getSubjectsByIds',userAction.middleware, subjectAction.getSubjectsByIds);
export default subjectRouter;