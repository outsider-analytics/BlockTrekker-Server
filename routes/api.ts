import { Router } from "express";
import { createEndpoint, deleteEndpoint, generateAPIKey, getAllEndpoints, getEndpointsByUser, getKey, runUserEndpoint } from "../controllers/api";
import { authenticateKey } from "../middleware/api";

const router = Router();

router.delete('/delete-endpoint', async (req, res) => {
    try {
        const { name, user } = req.query;
        await deleteEndpoint(user as string, name as string);
        res.status(200).send('Deleted successfully')
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

router.post('/create-endpoint', async (req, res) => {
    try {
        const data = req.body;
        await createEndpoint(data);
        res.status(200).send('Ok')
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

router.post('/custom/:user/:endpoint', authenticateKey, async (req, res) => {
    try {
        // const apiKey = res.locals;
        const { input } = req.body;
        const { endpoint, user } = req.params;
        const queryRes = await runUserEndpoint(endpoint, input, user);
        if (queryRes === null) {
            res.status(404).send('Could not find specified endpoint');
        } else {
            res.status(200).send(queryRes);
        }
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

router.get('/get-all-endpoints', async (req, res) => {
    try {
        const { user } = req.query;
        const endpoints = await getAllEndpoints(user as string);
        res.status(200).send(endpoints)
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

router.get('/get-endpoints', async (req, res) => {
    try {
        const { user } = req.query;
        const endpoints = await getEndpointsByUser(user as string);
        res.status(200).send(endpoints)
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

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

router.get('/results/:query', authenticateKey, async (req, res) => {
    try {
        const { query } = req.params;
        // const key = await generateAPIKey(user);
        res.status(200).send('Ok')
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});


router.post('/execute', authenticateKey, async (req, res) => {
    try {
        const { query } = req.body;
        // const { user } = req.body;
        // const key = await generateAPIKey(user);
        res.status(200).send('Ok')
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Error');
    }
});

export default router;