import { BigQuery } from "@google-cloud/bigquery";
import dotenv from 'dotenv';
dotenv.config();

const { BIG_QUERY_FILE_NAME, BIG_QUERY_PROJECT_ID } = process.env;

const auth = {
    keyFilename: BIG_QUERY_FILE_NAME,
    projectId: BIG_QUERY_PROJECT_ID
}

let client: BigQuery;

export const getBigQueryClient = () => client;

export const initBigQuery = () => {
    client = new BigQuery(auth)
}
