import mongoose from "mongoose";
import {OrderedMap, OrderedSet} from "js-sdsl";
import AttemptSchema from "./Schema/AttemptSchema.js";
import AttemptService from "./service/AttemptService.js";

const db_url = "mongodb+srv://asanosmanov217:FYx25aAwmPQnMQ77@cluster0.cnla5.mongodb.net/\n";
async function start() {
    try {
        await mongoose.connect(db_url);
    }catch (e){
        console.log(e);
    }
}
start()
let upperTime;
let MapOfTimeAttempt = new OrderedMap();
let MapOfAttempt = new OrderedMap();
let MapSetTimeout = new OrderedMap();

function AddMapOfTimeAttempt(time, attempt) {
    if(!MapOfTimeAttempt.getElementByKey(time)){
        MapOfTimeAttempt.setElement(time, new OrderedSet([attempt]) );
    }else{
        MapOfTimeAttempt.getElementByKey(time).insert(attempt);
    }
}
function RemoveMapOfTimeAttempt(time,attempt) {
    if(MapOfTimeAttempt.getElementByKey(time)){
        return MapOfTimeAttempt.getElementByKey(time).eraseElementByKey(attempt)
    }else{
        return false;
    }
}

function printMap(MapArray) {
    console.log("///////")
    for (const arrElement of MapArray) {
        if(arrElement[1] instanceof OrderedSet) {
            console.log(arrElement[0],":set")

            for (const arrElementElement of arrElement[1]) {
                console.log(arrElementElement)
            }
        }else{
            console.log(arrElement[0],":",arrElement[1])
        }
    }
    console.log("///////")
}

async function TimeOut(attempt){
    console.log(attempt, " - start finished")
    await AttemptService.StopAttempt(attempt)
    console.log(attempt, " - was finished")
}

function add(time, attempt) {
    let CurTime = Date.now();
    MapOfAttempt.setElement(attempt,time*1000 + CurTime);
    if(upperTime >= time*1000 + CurTime){
        console.log(attempt, " settimeout ", time*1000);
        let timeout = setTimeout(()=>{TimeOut(attempt)}, time*1000)
        MapSetTimeout.setElement(attempt, timeout)
    }else{
        AddMapOfTimeAttempt(time + CurTime, attempt);
    }
}
function remove(attempt) {
    let time = MapOfAttempt.getElementByKey(attempt);
    if(!time){
        return false;
    }
    if(!MapOfAttempt.eraseElementByKey(attempt)){
        return false;
    }
    clearTimeout(MapSetTimeout.getElementByKey(attempt));
    MapSetTimeout.eraseElementByKey(attempt);
    return RemoveMapOfTimeAttempt(time,attempt)
}


function Check(){
    try {
        console.log("Start check: ")
        upperTime = Date.now() + 3600000;
        for (let iterator= MapOfTimeAttempt.begin(); !iterator.equals(MapOfTimeAttempt.end()); ) {
            let it = [iterator.o.u,iterator.o.l];
            if (it[0] > upperTime) {
                break;
            }
            for (let itKey of it[1]) {
                let attempt = itKey;
                console.log(attempt, " settimeout ", it[0] - Date.now());
                let timeout = setTimeout(()=>{TimeOut(attempt)}, it[0] - Date.now())
                MapSetTimeout.setElement(attempt, timeout)
            }
            MapOfTimeAttempt.eraseElementByIterator(iterator);
        }

    }catch (e) {
        console.log(e)
    }
}

function Init(Attempts) {
    for (let i = 0; i < Attempts.length; i++) {
        if(Attempts[i].time <= 0){
            continue;
        }
        let Time = new Date(Attempts[i].startDate).getTime() + Attempts[i].time*1000;
        AddMapOfTimeAttempt(Time, Attempts[i]._id)
        MapOfAttempt.setElement(Attempts[i]._id,Time);
    }
    printMap(MapOfAttempt)
    printMap(MapOfTimeAttempt)
}

console.log(`Child process ${process.pid} is running`);
process.on('message', (m) => {
    switch (m.type) {
        case "init":{
            Init(m.data);
            Check();
            setInterval(async ()=>{
                Check();
            },3600000);
            console.log(`first check was finished`);
            break;
        }
        case "add":{
            add(m.data.time,m.data.attempt);
            break;
        }
        case "remove":{
            remove(m.data.attempt);
            break;
        }
    }
});