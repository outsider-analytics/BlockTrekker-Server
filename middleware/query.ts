import { NextFunction, Response, Request } from "express";
import { getUserCredits } from "../controllers/user";

export const ensureCredits = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Need to ensure cost is retrieved somehow for api call. Right now  assumes this can
    // be done through browser
    const { cost, user } = req.body;
    const credits = await getUserCredits(user);
    if (cost <= (credits ?? -1)) {
        next();
    } else {
        res.status(400).send('Insufficient balance. Reach out for more credits')
    }
}