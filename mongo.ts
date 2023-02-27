import { Collection, Db, Document, MongoClient } from 'mongodb';

let database: Db;
let mongoClient: MongoClient;
const tables: { [key: string]: Collection<Document> } = {};

export const getTable = (tableName: string) => {
    if (tables[tableName] === undefined) {
        tables[tableName] = database.collection(tableName);
    }

    return tables[tableName];
};

export const initMongo = async (url: string, name: string) =>
    new Promise(async (resolve, reject) => {
        try {
            const client = await MongoClient.connect(url);
            mongoClient = client;
            database = client.db(name);

            console.log(`🔥 Connected to ${name} mongo 🔥`);
            resolve(null);
        } catch (err) {
            reject(err);
            return;
        }
    });

export const getMongoClient = () => mongoClient;

export const getDatabase = () => database;