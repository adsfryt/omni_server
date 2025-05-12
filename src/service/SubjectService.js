import Subject from "../Schema/SubjectSchema.js";
import FileSystem from "../objects/FileSystem.js";
import Data from "../../Data.js";
import MongoService from "./MongoService.js";

export default new class SubjectService {

    async getSubjectsByIds(arraySubjects,fillGap=true){

        let response = await Subject.find({
            '_id': { $in: arraySubjects}
        });
        if(!response){
            throw new Error("can't find");
            return [];
        }
        let responseSort = [];
        for (let i = 0; i < arraySubjects.length; i++) {
            for (let j = 0; j < response.length; j++) {
                if(MongoService.id(response[j]) === arraySubjects[i]){
                    responseSort.push(response[j]);
                }
            }
        }

        if(fillGap){
            let array = new Array(arraySubjects.length).fill(null);

            let iter = 0;
            for (let i = 0; i < array.length; i++) {
                if(arraySubjects[i] === responseSort[iter]["_id"].toString()){

                    array[i] = responseSort[iter];
                    iter++;
                }
            }
            return array;
        }else{
            return responseSort;
        }
    }



}