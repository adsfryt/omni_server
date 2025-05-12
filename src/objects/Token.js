import jwt from "jsonwebtoken"
import Data from "../../Data.js";


export default new class TokenAction {
    checkAccessToken(token){
        try {
            var userData = jwt.verify(token,Data.AccessToken)
            return userData;
        }catch (e) {
            return null;
        }
    }
    checkRefreshToken(token){
        try {
            if (!token) {
                return null;
            }
            var userData = jwt.verify(token,Data.RefreshToken)
            return userData;
        }catch (e) {
            return null;
        }
    }
    createToken(userDto){
        try {
            var accessToken = jwt.sign({...userDto}, Data.AccessToken, {expiresIn:'40m'});
            var refreshToken = jwt.sign({...userDto}, Data.RefreshToken, {expiresIn:'30d'});

            return {accessToken, refreshToken};
        }catch (e) {
            return null;
        }
    }

}