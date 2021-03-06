//Store all application config variables in this file

const AppConfig = {
    APPLICATION_PORT: process.env.PORT || 5000,
    SECRET: 'SUPER_SECRET_SRBIJA_SRBIMA', // TODO: possibly embedded as environment variable so it's not directly visible,
    REFRESH_TOKEN_SECRET: "SUPER_SECRET_KOSOVO_I_METOHIJA",
    // 2 hours
    TOKEN_LIFESPAN: 7200,
    // 8 hours
    REFRESH_TOKEN_LIFESPAN: 28800,
    REDIS_PASSWORD: "fnligvu5",
    // REDIS_HOST: "165.22.66.219",
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    LOG_DIR: "../logs"
};

module.exports.AppConfig = AppConfig;