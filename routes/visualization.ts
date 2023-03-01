import { Router } from "express";
import { getAllVisualizationNames, removeVisualization, saveVisualization } from "../controllers/visualization";

const router = Router();

router.get('/names', async (req, res) => {
    try {
        const { user } = req.query;
        const results = await getAllVisualizationNames(user as string);
        res.status(200).send({ results });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.delete('/remove', async (req, res) => {
    try {
        const { queryId, vizPos } = req.query;
        await removeVisualization(queryId as string, Number(vizPos));
        res.status(200).send();
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/save/:queryId', async (req, res) => {
    try {
        const { queryId } = req.params;
        const visualization = req.body;
        await saveVisualization(queryId, visualization);
        res.status(200).send();
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;