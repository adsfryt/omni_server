import {Router} from "express";
import User from "../objects/User.js";
import Lecture from "../objects/Lecture.js";

let lectureRouter = new Router();
lectureRouter.post('/create',User.middleware, Lecture.create)
lectureRouter.post('/getLecturesBySubject',User.middleware, Lecture.getLecturesBySubject)
lectureRouter.post('/getLecturesByIds',User.middleware, Lecture.getLecturesByIds)
export default lectureRouter;