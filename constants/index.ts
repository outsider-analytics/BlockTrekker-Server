export const bigQueryToJS: { [key: string]: string } = {
    STRING: 'string',
    INTEGER: 'number',
    FLOAT: 'number',
    NUMERIC: 'number',
    BOOLEAN: 'boolean',
    TIMESTAMP: 'Date',
    DATE: 'Date',
    TIME: 'string', // or Date if you want to parse it as a time object
    DATETIME: 'Date',
    INTERVAL: 'string', // or number if you want to parse it as milliseconds
    GEOGRAPHY: 'string', // or a custom Geography class
    ARRAY: 'Array',
    STRUCT: 'Object', // or a custom Struct class
};

export const PROJECT_ID = 'ethtables';
export const USER_TABLES = 'user_tables';