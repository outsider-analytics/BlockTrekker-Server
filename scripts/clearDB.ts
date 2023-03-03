import { mongoConfig } from "../config";
import { MongoClient } from "mongodb";
import readline from 'readline';

(async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = async function () {
        return new Promise((resolve, reject) => {
            rl.question('Are you sure you want to clear all collections? This action is irreversable (y/n) ', function (answer) {
                const lowerAnswer = answer.toLowerCase();
                if (lowerAnswer === 'yes' || lowerAnswer === 'y') {
                    resolve(true);
                } else if (lowerAnswer === 'no' || lowerAnswer === 'n') {
                    resolve(false);
                } else {
                    prompt().then(resolve);
                }
            });
        });
    };

    const shouldClear = await prompt();
    rl.close();
    // Comment collections out as needed
    if (shouldClear) {
        const COLLECTIONS = ['api_keys', 'dashboards', 'queries', 'query_results', 'temporary_results'];

        try {
            const client = await MongoClient.connect(mongoConfig.mongoUrl);
            const database = client.db(mongoConfig.dbName);

            for (const collection of COLLECTIONS) {
                console.log(`Connection to ${collection} collection`);
                const col = database.collection(collection);
                console.log(`Deleting all documents for ${col}`);
                await col.deleteMany({});
                console.log(`All documents deleted for ${col}`);
            }
            console.log(`All collections cleard for ${mongoConfig.dbName}`);
        } catch (err) {
            console.log('Error: ', err);
        }
    }
})();