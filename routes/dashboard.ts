import { Router } from "express";
import { addWidgetToDashboard, getDashboard, saveDashboard, updateTextWidget } from "../controllers/dashboard";
import { appMiddleware } from "../middleware/app";

const router = Router();

router.get('/', appMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const address = req.userAddress;
        const { dashboard, queryData } = await getDashboard(address);
        res.status(200).send({ dashboard, queryData });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/save', appMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const address = req.userAddress;
        const dashboard = req.body;
        await saveDashboard(address, dashboard);
        res.status(200).send('Saved');
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/widget', appMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const address = req.userAddress;
        const { dashboard, widget } = req.body;
        const results = await addWidgetToDashboard(address, widget, dashboard);
        res.status(200).send(results);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.put('/widget', appMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const address = req.userAddress;
        const payload = req.body;
        await updateTextWidget(address, payload);
        res.status(200).send('Updated');
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;