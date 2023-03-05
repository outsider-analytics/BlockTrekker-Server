import { v4 } from 'uuid';
import { bigQueryToJS } from '../constants';

export const castColumn = (value: any, type: string) => {
    const jsType = bigQueryToJS[type];
    if (jsType === 'string') {
        return `'${value}'`
    } else {
        return value
    }
}

export const combineArrays = (arr1: any, arr2: any, key: string) => {
    // Create a new object to store the combined values
    const combined: any = {};

    // Loop through the first array and add each object to the combined object
    for (let i = 0; i < arr1.length; i++) {
        const obj = arr1[i];
        combined[obj[key]] = obj;
    }

    // Loop through the second array and add or update each object in the combined object
    for (let i = 0; i < arr2.length; i++) {
        const obj = arr2[i];
        const keyVal = obj[key];
        if (combined.hasOwnProperty(keyVal)) {
            // If the combined object already has an object with the same key, update it
            Object.assign(combined[keyVal], obj);
        } else {
            // Otherwise, add the new object to the combined object
            combined[keyVal] = obj;
        }
    }

    // Convert the combined object back into an array and return it
    return Object.values(combined);
}

export const generateUniqueId = () => {
    const buffer = v4(null, Buffer.alloc(16));
    return buffer.toString('hex');
}

export const jsonToCsv = (data: any) => {
    const separator = ',';
    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(separator);

    const csvRows = data.map((obj: any) => {
        return headers.map(header => {
            let cell = obj[header];
            // escape any commas and double quotes in the cell
            if (typeof cell === 'string') {
                cell = cell.replace(/"/g, '""');
                if (cell.includes(separator)) {
                    cell = `"${cell}"`;
                }
            }
            return cell;
        }).join(separator);
    });

    return `${csvHeader}\n${csvRows.join('\n')}`;
}

export const wrapTableInTemplates = (table: string) => {
    return '`' + table + '`';
}