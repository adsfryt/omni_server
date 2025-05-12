import querystring from "node:querystring";
import axios from "axios";
import Data from "../../Data.js";
import User from "../Schema/UserSchema.js";
import Service from "../service/UserService.js";
import tokenAction from "./Token.js";

export default new class UserAction{


    async loginYandex(req, res){
        try {
            var {code} = req.body;

            let {access_token, refresh_token} = await Service.requestYandexToken(code);
            let  {login, id, first_name, last_name, default_email} = await Service.requestYandexUserData(access_token);
            let {accessToken,refreshToken} = await Service.createUser(login, id,access_token,"yandex",first_name, last_name, default_email, refresh_token);
            res.json({
                refreshToken: refreshToken,
                accessToken: accessToken,
                userId: id
            });
        }catch (e){
            res.status(400).json({"error":"server"});
            console.log(e)
        }
    }
    async loginGithub(req, res){
        try {
            var {code} = req.body;
            let {access_token} = await Service.requestGithubToken(code);
            let  {login, id, first_name} = await Service.requestGithubUserData(access_token);
            let {accessToken,refreshToken} = await Service.createUser(login, id, access_token,"github", first_name);
            res.json({
                refreshToken: refreshToken,
                accessToken: accessToken,
                userId: id
            });
        }catch (e){
            res.status(400).json({"error":"server"});
            console.log(e)
        }
    }
    async getData(req, res){
        try {
            let userData =  JSON.parse(JSON.stringify(res.locals));
            delete userData.code;
            delete userData.codeExpireDate;
            delete userData.refreshToken;
            delete userData.refreshTokenService;
            delete userData.accessTokenService;
            res.json(userData);
            return;
        }catch (e){
            res.status(400).json({"error":"something happened"});
            console.log(e)
        }
    }
    async getPublicData(req, res){
        try {
            var {user} = req.query;
            let {firstName,lastName,userId,login} = await User.findOne({userId:user});
            res.json({firstName,lastName,userId,login} );
            return;
        }catch (e){
            res.status(400).json({"error":"something happened"});
            console.log(e)
        }
    }

    async refreshToken(req, res){
        try {
            var {refreshToken} = req.body;
            var refreshData = tokenAction.checkRefreshToken(refreshToken);
            if(!refreshData){
                return res.status(400).json({error:"not found token"});
            }
            var user = await User.findOne({userId: refreshData.userId});
            if (!user) {
                res.status(400).json({"error":"not found user"});
                return;
            }

            let accessTokenN,refreshTokenN;
            for (let i = 0; i < user.refreshToken.length; i++) {
                if(user.refreshToken[i][1] === refreshToken){
                    var userDto = {login: user.login, userId: refreshData.userId};
                    let Token = tokenAction.createToken(userDto);
                    accessTokenN = Token.accessToken;
                    refreshTokenN = Token.refreshToken;
                    user.refreshToken[i] = [accessTokenN,refreshTokenN];

                    await user.save();
                    break;
                }
            }

            if(!accessTokenN || !refreshTokenN){
                res.status(400).json({"error":"not found user"});
                return;
            }
            return res.json({accessToken: accessTokenN, refreshToken: refreshTokenN, userId: refreshData.userId});
        }catch (e){
            res.status(400).json({"error":"server"});
            console.log(e)
        }
    }
    async middleware(req, res, next){
        try {

            let accessToken = req.headers.accesstoken;

            if(!accessToken){
                res.status(400).json({"error":"no found token"});
                return;
            }

            var Data = tokenAction.checkAccessToken(accessToken);
            if(!Data){
                res.status(403).json({"error": "can't find user"});
                return;
            }

            let user = await User.findOne({userId:Data.userId});
            let i = 0;
            for (i = 0; i < user.refreshToken.length; i++) {
                if(accessToken === user.refreshToken[i][0]){
                    res.locals = user;
                    next();
                    break;
                }
            }
            if(i === user.refreshToken.length){
                res.status(403).json({"error": "can't find user"});
            }
        }catch (e){
            res.status(400).json({"error":"something happen"});
            console.log(e)
        }
    }

}