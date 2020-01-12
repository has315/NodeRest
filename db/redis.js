const redis = require("redis");
const client = redis.createClient(6379, 'localhost');

client.on('connect', function () {
    console.log('REDIS CLIENT CONNECTED');
    client.set("key", "value");
});

client.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = {
    client: client
};