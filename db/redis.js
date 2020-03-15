const redis = require("redis");
const AppConfig = require("./config").AppConfig;

const client = redis.createClient(AppConfig.REDIS_PORT, AppConfig.REDIS_HOST);
client.auth(AppConfig.REDIS_PASSWORD);
// client.on('connect', function () {
//     console.log('REDIS CLIENT CONNECTED');
//     client.set("key", "value");
// });

client.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = {
    client: client
};