import {Router} from "express";
import userAction from "../objects/User.js";
import subjectAction from "../objects/Subject.js";

let subjectRouter = new Router();
subjectRouter.post('/create',userAction.middleware, subjectAction.create);
subjectRouter.get('/getSubjectsByAuthUser',userAction.middleware, subjectAction.getSubjectsByAuthUser);
subjectRouter.post('/getSubjectsByIds',userAction.middleware, subjectAction.getSubjectsByIds);
export default subjectRouter;