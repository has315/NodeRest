const redis = require("redis");
const AppConfig = require("./config").AppConfig;

const redisConfig = {
  port: AppConfig.REDIS_PORT,
  host: AppConfig.REDIS_HOST,
  password: AppConfig.REDIS_PASSWORD,
};
const client = [];
const client = redis.createClient(redisConfig);
client.auth(AppConfig.REDIS_PASSWORD);
client.on("connect", function () {
  console.log("REDIS CLIENT CONNECTED");
});

client.on("error", function (err) {
  console.log("Error from client on" + err);
});

module.exports = {
  client: client,
};
