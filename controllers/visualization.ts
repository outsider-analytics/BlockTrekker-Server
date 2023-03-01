import { getTable } from "../mongo"
import { combineArrays } from "../utils";

const queries = getTable('queries');
const queryResults = getTable('query_results');

export const getAllVisualizationNames = async (user: string) => {
    const res = await queries.find({ user, visualizations: { $exists: true } }).project({ _id: 0, queryId: 1, visualizations: 1 }).toArray();
    return res;
}

export const removeVisualization = async (queryId: string, vizPos: number) => {
    // Set value equal to null
    await queries.updateOne(
        { queryId },
        {
            $unset: { [`visualizations.${vizPos}`]: "" },
        }
    );
    // Pull null values
    await queries.updateOne(
        { queryId },
        {
            $pull: { visualizations: null },
        }
    );
}

export const saveVisualization = async (queryId: string, visualization: any) => {
    await queries.updateOne(
        { queryId },
        { $push: { visualizations: visualization } },
        { upsert: true }
    );
}
