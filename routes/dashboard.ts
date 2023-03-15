import { Router } from "express";
import { addWidgetToDashboard, getDashboard, saveDashboard } from "../controllers/dashboard";

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
        const dashboard = req.body;
        const { user } = req.params;
        await saveDashboard(user, dashboard);
        res.status(200).send('Saved');
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/widget/:user', async (req, res) => {
    try {
        const { dashboard, widget } = req.body;
        const { user } = req.params;
        const results = await addWidgetToDashboard(user, widget, dashboard);
        res.status(200).send(results);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;