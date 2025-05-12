import {Router} from "express";
import File from "../objects/File.js";
import User from "../objects/User.js";

let fileRouter = new Router();

fileRouter.get("/banner", File.getBanner);
fileRouter.get("/lecture",User.middleware, File.getLecture);
fileRouter.get("/task",User.middleware, File.getTask);
fileRouter.get("/attempt/question",User.middleware);
export default fileRouter;