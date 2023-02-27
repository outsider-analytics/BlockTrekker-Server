import requests
import json
# from web3 import Web3, EthereumTesterProvider
import os
import csv
import time
from google.cloud import bigquery
# import pandas

credential_path = "keys/fixed-it-console-key.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

client = bigquery.Client()

table_id = "ethtables.test.dex"

schema = [
    bigquery.SchemaField("amount_usd", "FLOAT64"),
    bigquery.SchemaField("block_date", "TIMESTAMP"),
    bigquery.SchemaField("block_time", "TIMESTAMP"),
    bigquery.SchemaField("blockchain", "STRING"),
    bigquery.SchemaField("evt_index", "INTEGER"),
    bigquery.SchemaField("maker", "STRING"),
    bigquery.SchemaField("project", "STRING"),
    bigquery.SchemaField("project_contract_address", "STRING"),
    bigquery.SchemaField("taker", "STRING"),
    bigquery.SchemaField("token_bought_symbol", "STRING"),
    bigquery.SchemaField("token_pair", "STRING"),
    bigquery.SchemaField("token_sold_address", "STRING"),
    bigquery.SchemaField("token_sold_amount", "STRING"),
    bigquery.SchemaField("token_sold_symbol", "STRING"),
    bigquery.SchemaField("trace_address", "STRING"),
    bigquery.SchemaField("tx_from", "STRING"),
    bigquery.SchemaField("tx_hash", "STRING"),
    bigquery.SchemaField("tx_to", "STRING"),
    bigquery.SchemaField("token_sold_amount_raw", "FLOAT64"),
    bigquery.SchemaField("token_bought_address", "STRING"),
    bigquery.SchemaField("token_bought_amount", "FLOAT64"),
    bigquery.SchemaField("version", "STRING"),
    bigquery.SchemaField("token_bought_amount_raw", "FLOAT64"),
    ]

table = bigquery.Table(table_id, schema=schema)
table.clustering_fields = ["token_pair", "project"]
table = client.create_table(table)
print(
    "Created clustered table {}.{}.{}".format(
        table.project, table.dataset_id, table.table_id
    )
)