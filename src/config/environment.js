require('dotenv').config();

export const env = {
    BUILD_MODE: process.env.BUILD_MODE,
    MONGODB_URL: process.env.MONGODB_URL,
    DATABASE_NAME: process.env.DATABASE_NAME,
    APP_HOST: process.env.APP_HOST,
    APP_PORT: process.env.APP_PORT,
    AUTHOR: 'Pondevcode'
}
console.log(env.MONGODB_URL);
