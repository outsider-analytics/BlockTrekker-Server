import { BigQuery } from '@google-cloud/bigquery';
import { PROJECT_ID, USER_TABLES } from '../constants'

export const createUserTable = async (bigquery: BigQuery, user: string) => {
    const query = `
    CREATE TABLE ${PROJECT_ID}.${USER_TABLES}.${user}
    (
    fun_sig STRING,
    num_funsig INTEGER,
    )
    OPTIONS (
    )
    AS SELECT * FROM ethtables.test.sig_hashes`;

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const options = {
        query: query,
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);

    job.on('complete', (metadata) => {
        console.log(`Created new view ${user} via job ${metadata.id}`);
    });
}
