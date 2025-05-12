import Subject from "../Schema/SubjectSchema.js";
import LectureSchema from "../Schema/LectureSchema.js";
import User from "../Schema/UserSchema.js";
import MongoService from "./MongoService.js";

export default new class LectureService {
    async getLecturesByIds(arrayLectures,fillGap=true){

        let response = await LectureSchema.find({
            '_id': { $in: arrayLectures}
        });
        if(!response){
            throw new Error("can't find");
            return [];
        }

        let responseSort = [];
        for (let i = 0; i < arrayLectures.length; i++) {
            for (let j = 0; j < response.length; j++) {
                if(MongoService.id(response[j]) === arrayLectures[i]){
                    responseSort.push(response[j]);
                }
            }
        }
        //console.log(responseSort)
        if(fillGap){
            let array = new Array(arrayLectures.length).fill(null);

            let iter = 0;
            for (let i = 0; i < array.length; i++) {
                if(iter < responseSort.length && arrayLectures[i] ===  responseSort[iter]["_id"].toString()){
                    array[i] = responseSort[iter];
                    iter++;
                }
            }
            return array;
        }else{
            return responseSort;
        }

    }

    filter(User,Lectures,notFindInPrivelageList,findInSubscribeSubjects,fillGap= true){
        if(notFindInPrivelageList && !findInSubscribeSubjects){
            if(fillGap){
                return  new Array(Lectures.length).fill(null);
            }else{
                return [];
            }
        }

        if(notFindInPrivelageList) {
            let Maska = [];

            let newLectures = Lectures.map((key)=>{
                if(!key){
                    Maska.push(false);
                    return key;
                }
                let state = key.active && (key.allUsers ? !key.users.includes(User.userId) : key.users.includes(User.userId));
                Maska.push(state);
                if(state){
                    return key;
                }else{
                    return null;
                }

            });

            if(fillGap){
                return newLectures;
            }else{
                let array = newLectures.filter((_,id)=>{
                    return Maska[id];
                });

                return array;
            }
        }

        return Lectures;
    }

    filterDynamic(User,Lectures,fillGap= true){

        let Maska = [];
        let newLectures = Lectures.map((key)=>{
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
            return newLectures;
        }else{
            let array = newLectures.filter((_,id)=>{
                return Maska[id];
            });
            return array;
        }
    }

    filterBoolean(User,Lecture){

        if(!Lecture || !User){
            return false;
        }

        if( ( User.mySubjects.includes(Lecture.subject) || User.moderatorSubjects.includes(Lecture.subject)  )){
            return true;
        }
        if( ( User.subscribeSubjects.includes(Lecture.subject)  )){
            let state = Lecture.active && (Lecture.allUsers ? !Lecture.users.includes(User.userId) : Lecture.users.includes(User.userId));
            //key.users = undefined;
            return state;
        }else{
            return false;
        }
    }

}