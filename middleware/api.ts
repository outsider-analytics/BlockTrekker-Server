import { NextFunction, Response, Request } from "express";
import { getTable } from "../mongo";

const apiKeys = getTable('api_keys');

export const authenticateKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header("blocktrekker-api-key");
    if (!apiKey) {
        res.status(400).send('No API Key provided');
    } else {
        const key = await apiKeys.findOne({ apiKey });
        if (!key) {
            res.status(403).send('Invalid API key')
        } else {
            res.locals.apiKey = apiKey;
            next();
        }
    }
}
