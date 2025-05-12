import {Router} from "express";
import userAction from "../objects/User.js";
import questionAction from "../objects/Question.js";

let questionRouter = new Router();
questionRouter.post('/create',userAction.middleware, questionAction.create );
questionRouter.post('/getQuestionsBySubject',userAction.middleware,questionAction.getQuestionsBySubject );
questionRouter.post('/getQuestionsByIds',userAction.middleware, questionAction.getQuestionsByIds );
export default questionRouter;