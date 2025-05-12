import {Router} from "express";
import userAction from "../objects/User.js"
import Service from "../service/UserService.js";
let userRouter = new Router();

userRouter.post("/loginYandex",userAction.loginYandex)
userRouter.post("/loginGithub",userAction.loginGithub)
userRouter.get('/link',  Service.link);
userRouter.post('/data',  userAction.middleware, userAction.getData);
userRouter.get('/publicData', userAction.getPublicData);
userRouter.post('/refreshToken', userAction.refreshToken);
export default userRouter;