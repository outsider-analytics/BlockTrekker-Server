import { initBigQuery } from './bigQuery';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { initMongo } from './mongo';
import { mongoConfig } from './config';

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.listen(port, async () => {
    initBigQuery();
    console.log('Big query initialized 💿')
    await initMongo(mongoConfig.mongoUrl, mongoConfig.dbName);
    const routes = (await import('./routes')).routes as any;
    routes.forEach(({ route, baseRoute }: { route: any, baseRoute: string }) => {
        app.use(`/${baseRoute}`, route);
    });
    return console.log(`🔥 Express is listening at http://localhost:${port} 🔥`);
});