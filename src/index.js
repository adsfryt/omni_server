import express from "express"
import cors from "cors";
import fs from "fs";
import cluster from "cluster";
import os from "os";
import {validationResult} from "express-validator";
import mongoose from "mongoose"
import  cookieParser from "cookie-parser";
import userRouter from "./router/userRouter.js";
import fileRouter from "./router/fileRouter.js";
import * as path from 'node:path';
import subjectRouter from "./router/subjectRouter.js";
import fileUpload  from "express-fileupload"
import lectureRouter from "./router/lectureRouter.js";
import questionRouter from "./router/questionRouter.js";
import taskRouter from "./router/taskRouter.js";
import attemptRouter from "./router/attemptRouter.js";
import AttemptSchema from "./Schema/AttemptSchema.js";
// Чтобы добавить новый тип заданий нудно посмотреть AttemptService, QuestionService
const numCPUs = os.cpus().length;
import {OrderedMap,OrderedSet} from "js-sdsl";
const db_url = "mongodb+srv://asanosmanov217:FYx25aAwmPQnMQ77@cluster0.cnla5.mongodb.net/\n";
import { fork } from 'child_process';

const PORT = 5000;
const app = express();
console.log(`Master process ${process.pid} is running`);
var worker = fork("src/AttemptThread.js" );

app.use(fileUpload({
    defCharset: 'utf8',
    defParamCharset: 'utf8'
}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://192.168.1.106:3000", "http://localhost:3000"
    ],
    credentials: true,
}));


// console.log( fs.existsSync(path.join("src/objects")))
async function start() {
    try {
        app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT));
        await mongoose.connect(db_url);
        let unstoppedAttempts = await AttemptSchema.find({finished:false},"_id startDate time");
        worker.send({type:"init",data:unstoppedAttempts});
    }catch (e){
        console.log(e);
    }
}

export function addToArrSetInterval(time,attempt) {
    worker.send({type:"add",data: {time,attempt}});
}
export function removeFromArrSetInterval(attempt) {
    worker.send({type:"remove",data: {attempt}});
}



start();
app.use('/user',userRouter);
app.use('/subject',subjectRouter);
app.use('/file',fileRouter);
app.use('/lecture',lectureRouter);
app.use("/question",questionRouter);
app.use("/task",taskRouter);
app.use("/attempt",attemptRouter);

