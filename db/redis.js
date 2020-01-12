const redis = require("redis");
const client = redis.createClient();

client.on('connect', function () {
    console.log('REDIS CLIENT CONNECTED');
});

client.on('error', function () {
    console.log('REDIS CLIENT ERROR');
});

module.exports = {
    client: client
};