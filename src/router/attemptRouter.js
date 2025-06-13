import {Router} from "express";
import User from "../objects/User.js";
import Attempt from "../objects/Attempt.js";

let attemptRouter = new Router();
attemptRouter.post('/create',User.middleware,Attempt.create)
// потестить
//all
attemptRouter.post('/getAttemptById',User.middleware,Attempt.getAttemptById)
//student
attemptRouter.post('/getAttemptsInSubjectByAuthUser',User.middleware,Attempt.getAttemptsInSubjectByAuthUser)
attemptRouter.post('/getAttemptsInTaskByAuthUser',User.middleware,Attempt.getAttemptsInTaskByAuthUser)
// attemptRouter.post('/getAttemptsByIds',User.middleware,Attempt.getAttemptsByIds)
//moder
attemptRouter.post('/getAttemptsInTaskByUser',User.middleware,Attempt.getAttemptsInTaskByUser)
attemptRouter.post('/getAttemptsBySubject',User.middleware,Attempt.getAttemptsBySubject)
attemptRouter.post('/getAttemptsByUser',User.middleware,Attempt.getAttemptsByUser)
attemptRouter.post('/getAttemptsByTask',User.middleware,Attempt.getAttemptsByTask)
attemptRouter.post('/isTaskHaveAttempt',User.middleware,Attempt.isTaskHaveAttempt)
attemptRouter.post('/check',User.middleware) //пока не работает (проверка заданий именно от модератора)
attemptRouter.post('/finish',User.middleware)
attemptRouter.post('/getAttemptQuestions',User.middleware,Attempt.getAttemptQuestions)
attemptRouter.post('/saveAnswer',User.middleware,Attempt.saveAnswer)
attemptRouter.post('/stop',User.middleware,Attempt.stop)
export default attemptRouter;