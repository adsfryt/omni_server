import {Router} from "express";
import userAction from "../objects/User.js";
import TaskAction from "../objects/Task.js";

let taskRouter = new Router();
taskRouter.post('/create',userAction.middleware,TaskAction.create);
taskRouter.post('/update',userAction.middleware,TaskAction.update);
taskRouter.post('/getTasksBySubject',userAction.middleware,TaskAction.getTasksBySubject);
taskRouter.post('/getTasksByIds',userAction.middleware,TaskAction.getTasksByIds);
export default taskRouter;