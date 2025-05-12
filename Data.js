import {makeAutoObservable,makeObservable} from "mobx";

class Data{
    constructor() {
        makeAutoObservable(this)
    }
    ADDRESS_SITE="http://localhost:3000"
    Auth_address="http://localhost:5000"
    Main_address="http://79.174.91.102:4444"

    LectureFolder = "files/lectures/"
    TaskFolder = "files/tasks/"
    SubjectFolder = "files/subjects/"
    QuestionFolder = "files/questions/"

    AccessToken = "sdfuyintwefcxbtixdfggjhxcerf";
    RefreshToken = "wktnaowereiuthqe-egweviawioeuf";

    Yandex_client_id = "c104b7b26bc34515b82867a825142c7c";
    Github_client_id = "Ov23liKITzR2Uv3VpUis";
    Yandex_secret = "d6d59f098e434160b46649b9b7b748ad";
    Github_secret = "0ec1bf07a584b55adaaeec763550606d293df410";
}

export default new Data()