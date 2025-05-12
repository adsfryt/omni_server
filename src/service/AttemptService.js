
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
        return Result;
    }
}