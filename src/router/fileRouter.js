import {Router} from "express";
import File from "../objects/File.js";
import User from "../objects/User.js";

let fileRouter = new Router();

fileRouter.get("/banner", File.getBanner);
// fileRouter.get("/test", async (req,res)=>{
//     let sum = 0;
//     for (let i = 0; i < 50000000; i++) {
//         sum += Math.cos(i);
//     }
//     console.log(sum);
//     res.json({ok:true})
// });
fileRouter.get("/subject", File.getSubject);
fileRouter.get("/lecture",User.middleware, File.getLecture);
fileRouter.get("/task",User.middleware, File.getTask);
fileRouter.get("/question",User.middleware, File.getQuestion);
fileRouter.get("/attemptQuestion",User.middleware,File.getAttemptQuestion);
export default fileRouter;