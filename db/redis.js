const redis = require("redis");
const client = redis.createClient();

client.on('connect', function () {
    console.log('REDIS CLIENT CONNECTED');
});

client.on("error", function (err) {
    console.log("Error " + err);
});

client.set("bla", "bla", redis.print);


console.log("Out redis");

module.exports = {
    client: client
};