import LectureSchema from "../Schema/LectureSchema.js";
import MongoService from "./MongoService.js";
import TaskSchema from "../Schema/TaskSchema.js";

export default new class TaskService{

    async getTasksByIds(arrayTasks,fillGap=true){

        let response = await TaskSchema.find({
            '_id': { $in: arrayTasks}
        });
        if(!response){
            throw new Error("can't find");
            return [];
        }

        let responseSort = [];
        for (let i = 0; i < arrayTasks.length; i++) {
            for (let j = 0; j < response.length; j++) {
                if(MongoService.id(response[j]) === arrayTasks[i]){
                    responseSort.push(response[j]);
                }
            }
        }
        //console.log(responseSort)
        if(fillGap){
            let array = new Array(arrayTasks.length).fill(null);

            let iter = 0;

            for (let i = 0; i < array.length; i++) {
                if(iter < responseSort.length && arrayTasks[i] === responseSort[iter]["_id"].toString()){
                    array[i] = responseSort[iter];
                    iter++;
                }
            }
            return array;
        }else{
            return responseSort;
        }
    }

    filter(User,Tasks,notFindInPrivelageList,findInSubscribeSubjects,fillGap= true){
        if(notFindInPrivelageList && !findInSubscribeSubjects){
            if(fillGap){
                return  new Array(Tasks.length).fill(null);
            }else{
                return [];
            }
        }

        if(notFindInPrivelageList) {
            let Maska = [];

            let newTasks = Tasks.map((key)=>{
                if(!key){
                    Maska.push(false);
                    return key;
                }
                let state = (key.active && (key.allUsers ? !key.users.includes(User.userId) : key.users.includes(User.userId)));
                Maska.push(state);
                key.data.questions = undefined;
                key.data.finalMessage = undefined;
                key.users = undefined;
                key.allUsers = undefined;
                key.customSettings = undefined;
                key.script = undefined;

                if(state){
                    return key;
                }else{
                    return null;
                }

            });

            if(fillGap){
                return newTasks;
            }else{
                let array = newTasks.filter((_,id)=>{
                    return Maska[id];
                });

                return array;
            }
        }

        return Tasks;
    }


    filterDynamic(User,Tasks,fillGap= true){

        let Maska = [];
        let newTasks = Tasks.map((key)=>{
            if(!key){
                Maska.push(false);
                return key;
            }

            if( !( User.mySubjects.includes(key.subject) || User.moderatorSubjects.includes(key.subject)  )){
                if( !( User.subscribeSubjects.includes(key.subject)  )){
                    Maska.push(false);
                    return null
                }
                let state = key.active && (key.allUsers ? !key.users.includes(User.userId) : key.users.includes(User.userId));
                //key.users = undefined;
                key.data.questions = undefined;
                key.data.finalMessage = undefined;
                key.users = undefined;
                key.allUsers = undefined;
                key.customSettings = undefined;
                key.script = undefined;
                Maska.push(state);
                if(state){
                    return key;
                }else{
                    return null;
                }
            }else{
                Maska.push(true);
                return key;
            }
        });

        if(fillGap){
            return newTasks;
        }else{
            let array = newTask.filter((_,id)=>{
                return Maska[id];
            });
            return array;
        }
    }

    filterBoolean(User,Task){

        if(!Task || !User){
            return false;
        }

        if( ( User.mySubjects.includes(Task.subject) || User.moderatorSubjects.includes(Task.subject)  )){
            return true;
        }
        if( ( User.subscribeSubjects.includes(Task.subject)  )){
            let state = Task.active && (Task.allUsers ? !Task.users.includes(User.userId) : Task.users.includes(User.userId));
            //key.users = undefined;
            return state;
        }else{
            return false;
        }
    }
}