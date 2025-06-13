import QuestionSchema from "../Schema/QuestionSchema.js";
import MongoService from "./MongoService.js";

export default new class QuestionService{
    async getQuestionsByIds(arrayQuestions,fillGap=true){

        let response = await QuestionSchema.find({
            '_id': { $in: arrayQuestions}
        });
        if(!response){
            throw new Error("can't find");
            return [];
        }

        let responseSort = [];
        for (let i = 0; i < arrayQuestions.length; i++) {
            for (let j = 0; j < response.length; j++) {
                if(MongoService.id(response[j]) === arrayQuestions[i]){
                    responseSort.push(response[j]);
                }
            }
        }
        //console.log(responseSort)
        if(fillGap){
            let array = new Array(arrayQuestions.length).fill(null);

            let iter = 0;
            for (let i = 0; i < array.length; i++) {
                if(arrayQuestions[i] ===  responseSort[iter]["_id"].toString()){

                    array[i] = responseSort[iter];
                    iter++;
                }
            }
            return array;
        }else{
            return responseSort;
        }

    }

    filter(Questions,notFindInPrivelageList,findInSubscribeSubjects,fillGap= true){
        if(notFindInPrivelageList && !findInSubscribeSubjects){
            if(fillGap){
                return  new Array(Questions.length).fill(null);
            }else{
                return [];
            }
        }

        if(notFindInPrivelageList) {
            let Maska = [];
            let newQuestions = Questions.map((key)=>{
                if(!key){
                    Maska.push(false);
                    return key;
                }
                let state = key.public ;
                Maska.push(state);
                key = this.toPublicPresent(key);
                if(state){
                    return key;
                }else{
                    return null;
                }
            });
            if(fillGap){
                return newQuestions;
            }else{
                let array = newQuestions.filter((_,id)=>{
                    return Maska[id];
                });
                return array;
            }
        }
        return Questions;
    }

    toPublicPresent(Question){
        switch (Question.type) {
            case 0: {
                for (let i = 0; i < Question.data.length; i++) {
                    Question.data[i].hint = undefined;
                    Question.data[i].answer = undefined;
                    Question.data[i].results = undefined;
                }
                break;
            }
            default: break;
        }
        Question.tasks = undefined;
        return Question;
    }

    filterDynamic(User,Questions,fillGap= true){

        let Maska = [];
        let newQuestions = Questions.map((key)=>{
            if(!key){
                Maska.push(false);
                return key;
            }

            if( !( User.mySubjects.includes(key.subject) || User.moderatorSubjects.includes(key.subject)  )){
                if( !( User.subscribeSubjects.includes(key.subject)  )){
                    Maska.push(false);
                    return null
                }
                let state = key.public;
                //key.users = undefined;
                key = this.toPublicPresent(key);
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
            return newQuestions;
        }else{
            let array = newQuestions.filter((_,id)=>{
                return Maska[id];
            });
            return array;
        }
    }

    filterBoolean(User,Question){

        if(!Question || !User){
            return false;
        }

        if( ( User.mySubjects.includes(Question.subject) || User.moderatorSubjects.includes(Question.subject)  )){
            return true;
        }
        if( ( User.subscribeSubjects.includes(Question.subject)  )){
            let state = Question.public;
            //key.users = undefined;
            return state;
        }else{
            return false;
        }
    }

}