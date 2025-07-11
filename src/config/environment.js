require('dotenv').config();

export const env = {
    BUILD_MODE: process.env.BUILD_MODE,
    MONGODB_URL: process.env.MONGODB_URL,
    DATABASE_NAME: process.env.DATABASE_NAME,
    LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST,
    LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,
    AUTHOR: 'Pondevcode'
}
console.log(env.MONGODB_URL);
