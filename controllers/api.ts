import { getBigQueryClient } from "../bigQuery";
import { USER_TABLES } from "../constants";
import { getTable } from "../mongo"
import { castColumn, generateUniqueId, wrapTableInTemplates } from "../utils";

const apiKeys = getTable('api_keys');
const customEndpoints = getTable('custom_endpoints');

export const createEndpoint = async (data: any) => {
    await customEndpoints.insertOne(data);
}

export const deleteEndpoint = async (user: string, name: string) => {
    await customEndpoints.deleteOne({ user, name });
};

export const getAllEndpoints = async (user: string) => {
    return await customEndpoints.aggregate(
        [
            { $match: { user: { $ne: user } } },
            { $sample: { size: 100 } }
        ]
    ).project(
        {
            _id: 0,
            cost: 1,
            inputColumn: 1,
            name: 1,
            outputColumn: 1,
            query: 1,
            table: 1,
            user: 1
        }).toArray();
}

export const getKey = async (user: string) => {
    const res = await apiKeys.findOne({ user }, { projection: { _id: 0, apiKey: 1 } });
    return res?.apiKey;
}

export const generateAPIKey = async (user: string) => {
    const apiKey = generateUniqueId();
    await apiKeys.updateOne({ user }, { $set: { apiKey } }, { upsert: true })
    return apiKey;
}

export const getEndpointsByUser = async (user: string) => {
    return await customEndpoints.find({ user }).project({ _id: 0 }).toArray();
}

export const runUserEndpoint = async (endpoint: string, input: string, user: string) => {
    const res = await customEndpoints.findOne({ name: endpoint, user }, { projection: { _id: 0 } });
    if (res === null) {
        return res;
    } else {
        const bigQueryClient = getBigQueryClient();
        const {
            columnNames,
            columnTypes,
            inputColumn,
            query,
            queryId,
            table,
            user
        } = res;
        const inputColIndex = columnNames.findIndex((name: string) => name === inputColumn);
        const parsedQuery = query.replace(
            table,
            wrapTableInTemplates(
                `${USER_TABLES}.${user}_${queryId}`)).replace('<user_input>',
                    castColumn(input, columnTypes[inputColIndex])
                );
        const options = {
            query: parsedQuery,
            location: 'US',
        };
        const [job] = await bigQueryClient.createQueryJob(options);
        const [rows] = await job.getQueryResults();
        return rows;
    }
}