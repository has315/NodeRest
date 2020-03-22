const redisClient = require("../db/redis").client;
const AppConfig = require("../db/config").AppConfig;

const jwt_redis = require('jwt-redis');
const JWTR = jwt_redis.default;
const jwt = new JWTR(redisClient);
const HttpStatus = require('http-status-codes');

const isUserAdmin = (userId) => { return userId == 1; }

const authUser = (req, res, next) => {
    return authHelper(req, res, next);
};

const authAdmin = (req, res, next) => {
    return authHelper(req, res, next, isUserAdmin);
};

const authHelper = (req, res, next, checkAuthorizationCallback) => {

    const token = req.headers['x-access-token'] || req.headers['authorization'];
    console.log(`token: ${token}`);

    // Decode token
        // Remove unwanted prefix if exists
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        // Verify token
        if(        jwt.verify(token, AppConfig.SECRET)
        ){
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Verified'
            });
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized access.'
            });        }

}


module.exports = {
    authUser,
    authAdmin
};
