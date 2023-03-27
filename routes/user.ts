import { Router } from "express";
import { connectUser, getUserCredits } from "../controllers/user";

const router = Router();

router.post('/connect', async (req, res) => {
    try {
        const { user } = req.body;
        const userRes = await connectUser(user);
        res.status(200).send(userRes);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/credits', async (req, res) => {
    try {
        const { user } = req.query;
        const credits = await getUserCredits(user as string);
        res.status(200).send(credits);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;