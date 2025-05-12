import axios from "axios";
import querystring from "node:querystring";
import Data from "../../Data.js";
import User from "../Schema/UserSchema.js";
import Token from "../objects/Token.js";

export default new class UserService {

    async createUser(login, id,access_token,method,first_name="none", last_name="none", default_email="none", refresh_token="none"){
        var user = await User.findOne({userId: id})
        var userDto = {login: login, userId: id};
        var {accessToken,refreshToken} = Token.createToken(userDto);
        if (user) {
            user.refreshTokenService = refresh_token;
            user.accessTokenService = access_token;
            user.refreshToken.push([accessToken,refreshToken]);
            await user.save();
        }
        else {
            await User.create({
                "login": login,
                "userId": id,
                "email": default_email,
                "firstName": first_name,
                "lastName": last_name,
                "patronymic": "none",
                "subscribeSubjects": [],
                "mySubjects": [],
                "moderatorSubjects": [],
                "method": method,
                "refreshTokenService": refresh_token,
                "accessTokenService": access_token,
                "refreshToken": [[accessToken,refreshToken]],
                "code": "none",
                "codeExpireDate":1,
            });
        }
        return {accessToken,refreshToken};
    }

    async requestYandexToken(code){
        let responce_yandex_token = await axios.post("https://oauth.yandex.ru/token",
            querystring.stringify({
                "grant_type": "authorization_code",
                "code": code,
                "client_id": Data.Yandex_client_id,
                "client_secret": Data.Yandex_secret
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
        let {access_token, refresh_token} = responce_yandex_token.data;
        if (!(access_token && refresh_token)) {
            throw new Error("not found access and refresh token");
            return;
        }
        return {access_token, refresh_token};
    }
    async requestYandexUserData(access_token) {
        let responce_yandex = await axios.get("https://login.yandex.ru/info?format=json&oauth_token=" + access_token)
        let {login, id, first_name, last_name, default_email} = responce_yandex.data;
        id = "yandex" + id;
        if (!last_name) {
            last_name = "none";
        }
        if (!first_name) {
            first_name = "none";
        }
        if (!default_email) {
            default_email = "none";
        }
        return {login, id, first_name, last_name, default_email};
    }

    async requestGithubToken(code){
        let response_github_token = await axios.get("https://github.com/login/oauth/access_token", {
            params: {
                client_id:Data.Github_client_id,
                client_secret: Data.Github_secret,
                code: code,
            },
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "application/json",
            },
        });
        let {access_token}= response_github_token.data;

        if (!(access_token)) {
            throw new Error("not found access and refresh token");
            return;
        }
        return {access_token};
    }
    async requestGithubUserData(access_token) {
        let responce_github = await axios.get("https://api.github.com/user",{headers:{"Authorization":"Bearer " + access_token}})
        let { login, id, email } = responce_github.data;
        id = "github" + id;
        let first_name = login;
        if(!email){
            email= "none";
        }
        return {login, id, first_name};
    }

    async link(req,res){
        try{
            if(req.query.type === "yandex"){
                res.json({link: "https://oauth.yandex.ru/authorize?response_type=code&client_id="+Data.Yandex_client_id });
                return;
            }
            if(req.query.type === "github"){
                res.json({link: "https://github.com/login/oauth/select_account?client_id=" + Data.Github_client_id + "&response_type=code"});
                return;
            }
            res.json({link: ""});
        }
        catch (e) {
            res.status(400).json({"error":"server"});
        }
    }
    async addOwnerSubject(id,subject){
        if(subject instanceof String){
            throw new Error("incorrect data")
        }
        var user = await User.findOne({userId: id});
        if(!user){
            throw new Error("can't find user")
        }
        user.mySubjects.push(subject);
        await user.save();
    }

    checkInOwnerList(User,subject){
        if(User.mySubjects.includes(subject)){
            return true;
        }
        return false;
    }
    checkInModeratorList(User,subject){
        if(User.moderatorSubjects.includes(subject)){
            return true;
        }
        return false;
    }
    checkInSubscribeList(User,subject){
        if(User.subscribeSubjects.includes(subject)){
            return true;
        }
        return false;
    }
    checkInPrivelageList(User,subject){
        if(User.moderatorSubjects.includes(subject) || User.mySubjects.includes(subject) ){
            return true;
        }
        return false;
    }
}