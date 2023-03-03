import { getTable } from "../mongo"
import { generateKey } from "../utils";

const apiKeys = getTable('api_keys');

export const getKey = async (user: string) => {
    const res = await apiKeys.findOne({ user }, { projection: { _id: 0, apiKey: 1 } });
    return res?.apiKey;
}

export const generateAPIKey = async (user: string) => {
    const apiKey = generateKey();
    await apiKeys.updateOne({ user }, { $set: { apiKey } }, { upsert: true })
    return apiKey;
}