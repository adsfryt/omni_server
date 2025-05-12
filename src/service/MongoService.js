export default new class MongoService {
    id(Model){
        return Model["_id"].toString();
    }

}