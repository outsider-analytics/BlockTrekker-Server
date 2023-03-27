import { getBigQueryClient } from '../bigQuery';
import { Router } from "express";
import { writeFile, unlink } from 'fs';
import { generateUniqueId, jsonToCsv } from '../utils';
import {
    getAllQueriesForUser,
    getDatasets,
    getQuery,
    getQueryResults,
    getTableColumns,
    getTables,
    parseColumns,
    saveNewQuery,
    updateQuery,
    updateQueryMetaData
} from '../controllers/query';
import { ensureCredits } from '../middleware/query';
import { debitCredits } from '../controllers/user';

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

router.get('/columns', async (req, res) => {
    try {
        const { dataset, table } = req.query;
        const schema = await getTableColumns(dataset as string, table as string);
        res.status(200).send(schema);
    }
    catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
})

router.get('/datasets', async (req, res) => {
    try {
        const tables = await getDatasets();
        res.status(200).send(tables)
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    const { type, user } = req.query;
    // TODO: Add CSV
    const uniqueId = generateUniqueId();
    const fileName = `${uniqueId}.${(type as string).toLowerCase()}`
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    const json = (await getQueryResults(id as string, user as string));
    let fileString = '';
    if (type === 'CSV') {
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

router.post('/dry-run', async (req, res) => {
    try {
        const { query } = req.body;
        const options = {
            query,
            dry_run: true,
            location: 'US',
        };
        const [job] = await bigQueryClient.createQueryJob(options);
        const bytes = job.metadata.statistics.query.estimatedBytesProcessed;
        const cost = (bytes / (10 ** 12) * 5);
        res.status(200).send({ cost });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.post('/execute', ensureCredits, async (req, res) => {
    try {
        const { id, cost, name, query, user } = req.body;
        const dataset = bigQueryClient.dataset('user_tables');
        const destination = dataset.table(id && name ? `${user}_${name}` : `${user}_temp`);
        const options = {
            query,
            // Destination is temporary if no id exists
            destination,
            write_disposition: 'WRITE_TRUNCATE',
            location: 'US',
        };
        const [job] = await bigQueryClient.createQueryJob(options);
        const [metadata] = await destination.getMetadata();
        const [rows] = await job.getQueryResults();
        if (id) {
            // Update saved query
            const columns = parseColumns(metadata.schema.fields);
            await updateQuery(columns, query, id);
        }
        debitCredits(user, cost);
        res.status(200).send({ rows });
    } catch (err) {
        console.log('Err: ', err);
        res.status(500).send(err);
    }
});

router.post('/save', async (req, res) => {
    try {
        const data = req.body;
        if (data.query) {
            const queryId = await saveNewQuery(data);
            res.status(200).send({ queryId });
        } else {
            const { description, name, queryId } = req.body;
            await updateQueryMetaData(queryId, description, name);
            res.status(200).send('Metadata saved');
        }
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
});

router.get('/tables', async (req, res) => {
    try {
        const { user } = req.query;
        const tables = await getTables(user as string);
        res.status(200).send(tables);
    }
    catch (err) {
        console.log('Error: ', err);
        res.status(500).send(err);
    }
})

export default router;