import { getTable } from "../mongo"
import { getAllQueryResults, getQueryResults } from "./query";

const dashboards = getTable('dashboards');

export const addVisualizationToDashboard = async (user: string, widget: any, dashboard?: any) => {
    // If dashboard has not been saved yet then dashboard will first be saved
    if (dashboard) {
        await saveDashboard(user, dashboard);
    }
    const queryId = widget.item.content.id.split('-')[0];
    await dashboards.updateOne({ user }, { $addToSet: { queries: queryId }, $push: { dashboardWidgets: widget } })
    const results = await getQueryResults(queryId);
    return results;
}

export const getDashboard = async (user: string) => {
    const dashboard = await dashboards.findOne(
        { user },
        { projection: { _id: 0, dashboardWidgets: 1, queries: 1 } }
    );
    let queryData = {};
    // If dsahboard exists and query data then get query results
    if (dashboard && dashboard.queries) {
        const results = await getAllQueryResults(dashboard.queries);
        queryData = results.reduce((obj, query) => {
            obj[query.queryId] = query.results;
            return obj;
        }, {})
    }
    return { dashboard, queryData }
}

export const saveDashboard = async (user: string, dashboardWidgets: any) => {
    await dashboards.updateOne(
        { user },
        { $set: { dashboardWidgets, user } },
        { upsert: true }
    );
}