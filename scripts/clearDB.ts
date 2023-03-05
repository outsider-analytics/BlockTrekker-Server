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
            rl.question('Are you sure you want to clear all collections? This action is irreversible (y/n) ', function (answer) {
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
        const COLLECTIONS = ['api_keys', 'custom_endpoints', 'dashboards', 'queries'];

        try {
            const client = await MongoClient.connect(mongoConfig.mongoUrl);
            const database = client.db(mongoConfig.dbName);

            for (const collection of COLLECTIONS) {
                console.log(`Connection to ${collection} collection`);
                const col = database.collection(collection);
                console.log(`Deleting all documents for ${collection}`);
                await col.deleteMany({});
                console.log(`All documents deleted for ${collection}`);
            }
            console.log(`All collections cleared for ${mongoConfig.dbName}`);
        } catch (err) {
            console.log('Error: ', err);
        }
        process.exit();
    }
})();