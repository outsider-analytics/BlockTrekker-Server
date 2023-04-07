import { initBigQuery } from './bigQuery';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { initMongo } from './mongo';
import { mongoConfig } from './config';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
dotenv.config();

const { SESSION_SECRET } = process.env;

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

app.use(session({
    name: 'blocktrekker-session',
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET ?? '',
    store: MongoStore.create({
        collectionName: 'sessions',
        dbName: mongoConfig.dbName,
        mongoUrl: mongoConfig.mongoUrl,
        ttl: 3 * 24 * 60 * 60 * 1000,
        autoRemove: 'native'
    }),
    cookie: { maxAge: 3 * 24 * 60 * 60 * 1000, secure: false, sameSite: true },
}))


app.listen(PORT, async () => {
    initBigQuery();
    console.log('Big query initialized 💿')
    await initMongo(mongoConfig.mongoUrl, mongoConfig.dbName);
    const routes = (await import('./routes')).routes as any;
    routes.forEach(({ route, baseRoute }: { route: any, baseRoute: string }) => {
        app.use(`/${baseRoute}`, route);
    });
    return console.log(`🔥 Express is listening at http://localhost:${PORT} 🔥`);
});