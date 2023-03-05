import { getTable } from "../mongo"
import { generateUniqueId } from "../utils";
import { getBigQueryClient } from "../bigQuery";
import { PUBLIC_DATA_SETS, USER_TABLES } from "../constants";
const queries = getTable('queries');

export const getAllQueriesForUser = async (user: string) => {
    return await queries.find({ user }).project({
        _id: 0,
        name: 1,
        queryId: 1,
        visualizationCount: { $size: { $ifNull: ["$visualizations", []] } }
    }
    ).toArray();
}

export const getQuery = async (queryId: string) => {
    const query = await queries.findOne({ queryId });
    const results = await getQueryResults(queryId, query?.user);
    return {
        columns: query?.columnNames,
        description: query?.description,
        name: query?.name,
        results,
        query: query?.query,
        visualizations: query?.visualizations
    };
}

export const getAllQueryResults = async (queryIds: string[], user: string) => {
    const bigQueryClient = getBigQueryClient();
    const dataset = bigQueryClient.dataset(USER_TABLES);
    return await Promise.all(queryIds.map(async (queryId) => {
        const table = dataset.table(`${user}_${queryId}`);
        return {
            queryId, results: (await table.getRows())[0]
        };
    }))
}

export const getDatasets = async () => {
    const bigQueryClient = getBigQueryClient();
    const allTables: any[] = [];
    for (const name of PUBLIC_DATA_SETS) {
        const dataset = bigQueryClient.dataset(name);
        const tables = await dataset.getTables();
        allTables.push({ [name]: tables[0].map(table => table.id || '') });
    }
    return allTables;
}

export const getQueryResults = async (queryId: string, user: string) => {
    // TODO: Replace with BigQuery
    const bigQueryClient = getBigQueryClient();
    const dataset = bigQueryClient.dataset('user_tables');
    const table = dataset.table(`${user}_${queryId}`);
    return (await table.getRows())[0];
}

export const getTableColumns = async (dataset: string, table: string) => {
    const bigQueryClient = getBigQueryClient();
    const set = bigQueryClient.dataset(dataset);
    const tbl = set.table(table);
    const [metadata] = await tbl.getMetadata();
    return metadata.schema.fields;
}

export const getTables = async (user: string) => {
    return await queries.find({ user }).project(
        {
            _id: 0,
            columnNames: 1,
            columnTypes: 1,
            name: 1,
            queryId: 1
        }
    ).toArray();
}

export const parseColumns = (fields: any) => {
    const columnNames = fields.map(({ name }: { name: string }) => name);
    const columnTypes = fields.map(({ type }: { type: string }) => type);
    return { columnNames, columnTypes }
}

export const saveNewQuery = async (data: any) => {
    const { user } = data;
    // Rename temporary table
    const queryId = generateUniqueId();
    const bigQueryClient = getBigQueryClient();
    const dataset = bigQueryClient.dataset('user_tables');
    const fromTable = dataset.table(`${user}_temp`);
    const destTable = dataset.table(`${user}_${queryId}`);
    await fromTable.copy(destTable, fromTable.metadata);
    const [metadata] = await fromTable.getMetadata();
    const { columnNames, columnTypes } = parseColumns(metadata.schema.fields);
    await storeQuery(queryId, { columnNames, columnTypes, ...data });
    return queryId;
}

const storeQuery = async (queryId: string, data: any) => {
    await queries.updateOne({ queryId }, { $set: { queryId, ...data } }, { upsert: true });
}

export const updateQuery = async (columns: { [key: string]: string[] }, query: string, queryId: string) => {
    const { columnNames, columnTypes } = columns;
    await queries.updateOne({ queryId }, { $set: { columnNames, columnTypes, query } });
}

export const updateQueryMetaData = async (queryId: string, description: string, name: string) => {
    await queries.updateOne({ queryId }, { $set: { description, name } });
}