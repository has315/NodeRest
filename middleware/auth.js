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
        jwt.verify(token, AppConfig.SECRET).then(decoded => {
            console.log(`decoded: ${decoded}`);
            if (!err) {
                // If checkAuthorizationCallback is true => (super)admin-specific route
                if (checkAuthorizationCallback && checkAuthorizationCallback(decoded.account_level)) {
                    req.decoded = decoded;
                    next();
                }
                // If checkAuthorizationCallback is false => available for all logged users
                else if (!checkAuthorizationCallback) {
                    req.decoded = decoded;
                    next();
                } else {
                    // Logged user can't access (super)admin-specific routes
                    return res.status(HttpStatus.UNAUTHORIZED).json({
                        success: false,
                        message: 'Unauthorized access.'
                    });
                }
            } else {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    error: true,
                    success: false,
                    message: 'Unauthorized access.'
                });
            }
        }).catch(err => { throw err; });
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
