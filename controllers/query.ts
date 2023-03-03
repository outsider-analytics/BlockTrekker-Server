import { getTable } from "../mongo"
import { v4 as uuidv4 } from "uuid";
import { combineArrays } from "../utils";

const queries = getTable('queries');
const queryResults = getTable('query_results');
const temporaryResults = getTable('temporary_results');

export const saveNewQuery = async (data: any) => {
    const { user } = data;
    const results = (await temporaryResults.findOne({ user }))!.results;
    const queryId = uuidv4().replace(/-/g, '');
    await storeQueryResults(queryId, results);
    await storeQuery(queryId, data);
    return queryId;
}

export const getAllQueriesForUser = async (user: string) => {
    return await queries.find({ user }).project({ _id: 0, queryId: 1 }).toArray();
}

export const getQuery = async (queryId: string) => {
    const query = await queries.findOne({ queryId });
    const results = await getQueryResults(queryId);
    return {
        results: results!.results,
        query: query!.query,
        visualizations: query?.visualizations
    };
}

export const getAllQueryResults = async (queryIds: string[]) => {
    // TODO: Replace with BigQuery
    return await queryResults.find({ queryId: { $in: queryIds } }).project({ _id: 0, queryId: 1, results: 1 }).toArray();
}

export const getQueryResults = async (queryId: string) => {
    // TODO: Replace with BigQuery
    return await queryResults.findOne({ queryId }, { projection: { _id: 0, queryId: 1, results: 1 } });
}

const storeQuery = async (queryId: string, data: any) => {
    await queries.updateOne({ queryId }, { $set: { queryId, ...data } }, { upsert: true });
}

const storeQueryResults = async (queryId: string, results: any) => {
    // TODO: Replace with BigQuery
    await queryResults.updateOne({ queryId }, { $set: { queryId, results } }, { upsert: true });
}

export const storeTemporaryResults = async (user: string, results: any[]) => {
    // TODO: Replace with BigQuery
    await temporaryResults.updateOne({ user }, { $set: { user, results } }, { upsert: true });
}

export const updateQuery = async (query: string, queryId: string, results: any[]) => {
    await queries.updateOne({ queryId }, { $set: { query } });
    await storeQueryResults(queryId, results);
}