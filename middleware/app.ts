import cors from 'cors';
import { NextFunction } from 'express';
import { APP_ALLOWED_ORIGINS } from '../constants';
import { Response } from 'express';

// TODO: Change from any
export const appMiddleware = (req: any, res: Response, next: NextFunction) => {
    cors({
        credentials: true,
        origin: APP_ALLOWED_ORIGINS
    })(req, res, () => {
        if (!req.session.siwe) {
            res.status(422).send("Session not found")
        } else {
            req.userAddress = req.session.siwe.address;
            next();
        }
    })
}