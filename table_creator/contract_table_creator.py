import requests
import json
from web3 import Web3, EthereumTesterProvider
import os
import csv
import time
from google.cloud import bigquery
import pandas

    
credential_path = "keys/fixed-it-console-key.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

# using Web3 for keccak256 so shouldn't need to connect to an RPC
# w3 = Web3(EthereumTesterProvider())
# print(w3.isConnected)

# Start a timing tracker
start_time = time.time()

# Get around the f string \ problem
new_line = "\n" 

class Contract:
  def __init__(self, address):
    self.address =  address
    self.evt_names = []
    self.fx_names = []

class Event:
  def __init__(self, contract_address, evt_name, inputs):
    self.contract_address = contract_address
    self.evt_name = evt_name
    self.inputs = inputs
    self.input_names = []
    self.input_types = []
    self.query_lines = []

class Function:
  def __init__(self, contract_address, fx_name, inputs):
    self.contract_address = contract_address
    self.fx_name = fx_name
    self.inputs = inputs
    self.input_names = []
    self.input_types = []
    self.query_lines = []

def query_bigquery(full_name, query_body, inputs):
    
    client = bigquery.Client()
    # query_job = client.query(
    #     query_body
    # )


    # results = query_job.result()  # Waits for job to complete.
    # print("--- %s seconds ---" % (time.time() - start_time))
    # print(query_body, new_line, inputs)

    # df = results.to_dataframe()
    # df.to_csv(f'{name}.csv',index=False, encoding='utf-8', sep = ',')

    # with open(f'{name}.csv', 'w', newline='') as file:
    #     writer = csv.writer(file)
    #     writer.writerow(results[])
    #     for row in results:
    #         writer.writerow(row)

def query_etherscan(address, etherscan_api_key):
    response = requests.get(f"https://api.etherscan.io/api?module=contract&action=getabi&address={address}&apikey={etherscan_api_key}")
    result = json.loads(response.json()["result"])
    return result

def create_table(name, full_name, inputs, types):
    schema_types = ["INT64", "FLOAT64", "NUMERIC", "BIGNUMERIC", "BOOL", "STRING", "BYTES", "DATE", "DATETIME", "TIME", "TIMESTAMP", "STRUCT", "GEOGRAPHY", "JSON"]
    
    client = bigquery.Client()
    
    table_id = f"starlit-sandbox-349500.test.{name}"
    schema = []

    for i in range(len(inputs)):
        if types[i] not in schema_types:
            types[i] = "STRING"
        schema.append(bigquery.SchemaField(inputs[i],types[i]))
    
    table = bigquery.Table(table_id, schema=schema)
    table = client.create_table(table)
    print(
        "Created table {}.{}.{}".format(table.project, table.dataset_id, table.table_id)
    )


# should change it inputs:
address = "0xe66b31678d6c16e9ebf358268a790b763c133750"
table = ""
etherscan_api_key = "GE3TV3BEV2J2EIAJU9DHRYZ4U7R7FMPZBB"

results = query_etherscan(address, etherscan_api_key)

contract = Contract(address)
contract_dict = {}

for result in results:
    if result["type"] == "event":
        contract.evt_names.append(result["name"])
        evt_id = Event(contract.address,result["name"],result["inputs"])
        for input in evt_id.inputs:
            evt_id.input_names.append(input["name"])
            evt_id.input_types.append(input["type"])
        evt_id.full_name = f'{evt_id.evt_name}({",".join(evt_id.input_types)})'
        evt_id.evt_hash = Web3.keccak(text=evt_id.full_name).hex()[0:10]
        
        count = 0
        for input in evt_id.inputs:
            evt_id.query_lines.append(f"SUBSTRING(input, {11 + 64 * count}, {64}) as {input['name']}")
            count = count + 1 
        
        evt_id.query_body = f"SELECT{new_line} {','.join(evt_id.query_lines)}{new_line} FROM {table}{new_line}WHERE LEFT(input,10) = '{evt_id.evt_hash}'{new_line}AND to_address = '{address}'"
        # print("Event", new_line, evt_id.query_body)
        contract_dict[result["name"]] = evt_id

    elif result["type"] == "function":
        contract.fx_names.append(result["name"])
        fx_id = result["name"]
        fx_id = Function(contract.address,result["name"],result["inputs"])
        for input in fx_id.inputs:
            fx_id.input_names.append(input["name"])
            fx_id.input_types.append(input["type"])
        fx_id.full_name = f'{fx_id.fx_name}({",".join(fx_id.input_types)})'
        fx_id.fx_hash = Web3.keccak(text=fx_id.full_name).hex()[0:10]
        
        count = 0
        for input in fx_id.inputs:
            fx_id.query_lines.append(f"SUBSTRING(input, {11 + 64 * count}, {64}) as {input['name']}")
            count = count + 1 
        
        new_line = "\n"
        fx_id.query_body = f"SELECT{new_line} {','.join(fx_id.query_lines)}{new_line} FROM {table}{new_line}WHERE LEFT(input,10) = '{fx_id.fx_hash}'{new_line}AND to_address = '{address}'"
        contract_dict[result["name"]] = fx_id

for name in contract.fx_names:
    if  len(contract_dict[name].input_names) > 0:
        full_name = contract_dict[name].full_name
        query_body = contract_dict[name].query_body
        query_inputs = contract_dict[name].input_names
        query_types = contract_dict[name].input_types
        # query_bigquery(full_name, query_body, query_inputs)

        # create_table(name, full_name, query_inputs, query_types)