import { Router } from "express";
import { generateAPIKey, getKey } from "../controllers/api";

const router = Router();

router.get('/key', async (req, res) => {
    try {
        const { user } = req.query;
        const key = await getKey(user as string);
        res.status(200).send(key)
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

router.post('/key', async (req, res) => {
    try {
        const { user } = req.body;
        const key = await generateAPIKey(user);
        res.status(200).send(key)
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

export default router;