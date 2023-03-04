import { getTable } from "../mongo"
import { generateUniqueId } from "../utils";

const apiKeys = getTable('api_keys');
const customEndpoints = getTable('custom_endpoints');

export const createEndpoint = async (data: any) => {
    await customEndpoints.insertOne(data);
}

export const deleteEndpoint = async (user: string, name: string) => {
    await customEndpoints.deleteOne({ user, name });
};

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