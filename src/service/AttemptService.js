import AttemptSchema from "../Schema/AttemptSchema.js";
import QuestionService from "./QuestionService.js";

export default new class AttemptService {
    CreateEmptyResultQuestion(Question,variant){
        let Result = {};
        switch (Question.type) {
            case 0: {
                Result = {answers:new Array(Question.data[variant].answer.length).fill(false),hints:0}
                break;
            }
            default: break;
        }
        Result.type = Question.type;
        return Result;
    }

    async StopAttempt(attempt,Attempt={}){

        await this.check(attempt,Attempt);
        console.log("hhhhh")
        let NewAttempt = await AttemptSchema.findByIdAndUpdate(attempt,{$set:{finished:true,endDate:Date.now()}} );
    }

    async check(attempt,Attempt){
        if(!Attempt._id){
            Attempt = await AttemptSchema.findById(attempt);
        }
        let Results = Attempt.results;
        let Questions = await QuestionService.getQuestionsByIds(Attempt.questions.map((key)=>{ return key[2] } ))
        let Sum = 0;
        for (let i = 0; i < Attempt.answers.length; i++) {
            if(!Questions[i]){
                continue;
            }
            let goToNext = false;
            switch (Attempt.answers[i].type) {
                case 0:{
                    let QuestionData = Questions[i].data[Attempt.questions[i][1]];
                    let missCheckAll = QuestionData.missCheckAll;
                    let extraCheckAll = QuestionData.extraCheckAll;
                    //console.log(missCheckAll,extraCheckAll);
                    let missCheck = 0;
                    let extraCheck = 0;
                    if(Attempt.answers[i].answers.length !== QuestionData.answer.length){
                        goToNext = true;
                        break;
                    }
                    let Result = 0;
                    let countMarked = 0;
                    let maxCheckBool = QuestionData.maxCheck > 0;
                    console.log(maxCheckBool)
                    for (let j = 0; j < Attempt.answers[i].answers.length; j++) {
                        if(Attempt.answers[i].answers[j] === true){
                            countMarked++;
                            if(maxCheckBool && countMarked > QuestionData.maxCheck){
                                break;
                            }
                        }
                        console.log(Attempt.answers[i].answers[j],QuestionData.answer[j].check)
                        if(Attempt.answers[i].answers[j] === true && QuestionData.answer[j].check === false){
                            missCheck++;
                        }
                        if(Attempt.answers[i].answers[j] === false && QuestionData.answer[j].check === true){
                            extraCheck++;
                        }
                        if(Attempt.answers[i].answers[j] === QuestionData.answer[j].check && QuestionData.answer[j].check === true){
                            Result += QuestionData.answer[j].points;
                        }
                    }
                    console.log({missCheck, extraCheck, countMarked, Result,maxCheckBool})

                    if(extraCheck || missCheck){
                        if(missCheckAll && missCheck){
                            Result = 0;
                        }else{
                            Result -= missCheck*QuestionData.missCheck;
                        }
                        if(extraCheckAll && extraCheck){
                            Result = 0;
                        }else{
                            Result -= extraCheck*QuestionData.extraCheck;
                        }
                    }
                    console.log({Result})
                    console.log(QuestionData.minPoints > QuestionData.maxPoints, QuestionData.minPoints > Result,QuestionData.maxPoints < Result)
                    if(!(QuestionData.minPoints > QuestionData.maxPoints)){
                        if(QuestionData.minPoints > Result){
                            Result = QuestionData.minPoints;
                        }
                        if(QuestionData.maxPoints < Result){
                            Result = QuestionData.maxPoints;
                        }
                    }
                    console.log({Result})
                    Results[i] = Result;
                    Sum += Result;
                    break;
                }
            }

            if(goToNext){
                continue;
            }
        }
        let NewAttempt = await AttemptSchema.findByIdAndUpdate(attempt,{$set:{results:Results,resultsPoint:Sum}} );

    }
}