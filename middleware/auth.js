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
    if (token) {
        // Remove unwanted prefix if exists
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        // Verify token
        if(        jwt.verify(token, AppConfig.SECRET)
        ){
            console.log('succesfull verify')
        } else {
            console.log('bad verify')
        }
    } else {
        res.status(HttpStatus.FORBIDDEN).json({
            error: true,
            success: false,
            message: 'No token provided.'
        });
    }

}


module.exports = {
    authUser,
    authAdmin
};
