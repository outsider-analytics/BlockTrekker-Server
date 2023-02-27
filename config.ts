import dotenv from 'dotenv';
dotenv.config();

const { MONGO_DB_NAME, MONGO_URL } = process.env;

export const mongoConfig = {
    dbName: MONGO_DB_NAME as string,
    mongoUrl: MONGO_URL as string,
};