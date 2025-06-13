import { Worker, isMainThread, parentPort } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from "mongoose";
import AttemptSchema from "./src/Schema/AttemptSchema.js";

const db_url = "mongodb+srv://asanosmanov217:FYx25aAwmPQnMQ77@cluster0.cnla5.mongodb.net/\n";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function start() {
    try {
        await mongoose.connect(db_url, {useUnifiedTopology: true, useNewUrlParser: true});
    }catch (e){
        console.log(e);
    }
}

async function gg(){
    let date = new Date();

    let r = await AttemptSchema.findById('681fcdc4936065d2e6f5068c');
    console.log("1",r)
    r.results[0] = 20;
    r.save();

    let date2 = new Date();

    console.log("1",date2 - date)
}


async function gg1(){
    let date = new Date();

    let r = await AttemptSchema.findById('681fcdc4936065d2e6f5068c');
    console.log("2",r)
    r.results[1] = 20;
    r.save();

    let date2 = new Date();
    console.log("2",date2 - date)

}
const fetch = require("node-fetch");
async function fn(){
    setTimeout(async ()=>{
        let a = await fetch("http://127.0.0.1:3000/time");
        let a_json = await a.json();
        if(a_json.time === 0){
            throw new Error('Error');
        }
    },4000)
}
fn();

if (isMainThread) {
    start();
    const worker = new Worker(__filename);
    setTimeout(()=>{
        gg();
    },1200)
} else {
    setTimeout(()=> {
        start();
        gg1();
    },10)

}