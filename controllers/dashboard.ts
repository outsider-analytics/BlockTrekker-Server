import { getTable } from "../mongo"

const dashboards = getTable('dashboards');
const queryResults = getTable('query_results');

export const addVisualizationToDashboard = async (user: string, widget: any) => {
    const queryId = widget.item.content.id.split('-')[0];
    await dashboards.updateOne({ user }, { $addToSet: { queries: queryId }, $push: { dashboardWidgets: widget } })
}

export const getDashboard = async (user: string) => {
    const dashboard = await dashboards.findOne(
        { user },
        { projection: { _id: 0, dashboardWidgets: 1, queries: 1 } }
    );
    const results = await queryResults.find({ queryId: { $in: dashboard?.queries ?? [] } }).project({ _id: 0, queryId: 1, results: 1 }).toArray()
    const queryData = results.reduce((obj, query) => {
        obj[query.queryId] = query.results;
        return obj;
    }, {})
    return { dashboard, queryData }
}

export const saveDashboard = async (user: string, dashboardWidgets: any, queries: any) => {
    await dashboards.updateOne(
        { user },
        { $set: { dashboardWidgets, user } },
        { upsert: true }
    );
}