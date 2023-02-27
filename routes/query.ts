import { getBigQueryClient } from '../bigQuery';
import { Router } from "express";
import { writeFile, unlink } from 'fs';
import { jsonToCsv } from '../utils';
import {
    getAllQueriesForUser,
    getQuery,
    getQueryResults,
    saveNewQuery,
    storeTemporaryResults,
    updateQuery
} from '../controllers/query';
import { v4 as uuidv4 } from 'uuid';

const bigQueryClient = getBigQueryClient();
const router = Router();

router.get('/', async (req, res) => {
    try {
        const { id } = req.query;
        const query = await getQuery(id as string);
        res.status(200).send({ query });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/all', async (req, res) => {
    try {
        const { user } = req.query;
        const queries = await getAllQueriesForUser(user as string);
        res.status(200).send({ queries });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    const fileType = req.query.type as string;
    // TODO: Add CSV
    const fileName = `${uuidv4()}.${fileType.toLowerCase()}`
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    const json = (await getQueryResults(id as string))!.results;
    let fileString = '';
    if (fileType === 'CSV') {
        fileString = jsonToCsv(json);
    } else {
        fileString = JSON.stringify(json);
    }
    writeFile(fileName, fileString, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error generating CSV file');
            return;
        }
        res.download(fileName, err => {
            if (err) {
                res.status(500).send('Error downloading CSV file');
                console.error(err);
            }

            // Delete the temporary file after the response is sent
            unlink(fileName, err => {
                if (err) {
                    console.error(err);
                }
            });
        });
    });
});

router.post('/execute', async (req, res) => {
    try {
        const { id, query, user } = req.body;
        const options = {
            query,
            location: 'US',
        };
        const [job] = await bigQueryClient.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        // If no id we know this is a new query
        if (!id) {
            // Update temporary results
            await storeTemporaryResults(user, rows);
        } else {
            // Update saved query
            await updateQuery(query, id, rows);
        }
        res.status(200).send({ rows });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/save', async (req, res) => {
    try {
        const data = req.body;
        const queryId = await saveNewQuery(data);
        res.status(200).send({ queryId });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

export default router;