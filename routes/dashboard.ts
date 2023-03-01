import { Router } from "express";
import { addVisualizationToDashboard, getDashboard, saveDashboard } from "../controllers/dashboard";

const router = Router();

router.get('/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const { dashboard, queryData } = await getDashboard(user);
        res.status(200).send({ dashboard, queryData });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/save/:user', async (req, res) => {
    try {
        const { dashboard, queries } = req.body;
        const { user } = req.params;
        await saveDashboard(user, dashboard, queries);
        res.status(200).send('Saved');
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/visualization/:user', async (req, res) => {
    try {
        const widget = req.body;
        const { user } = req.params;
        await addVisualizationToDashboard(user, widget);
        res.status(200).send('Saved');
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;