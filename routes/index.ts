import fs from 'fs';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const currentFile = basename(__filename);
export const routes = await Promise.all(fs
    .readdirSync(__dirname)
    .filter((f: any) => f !== currentFile && !f.startsWith(".") && f.endsWith(".ts"))
    .map(async (f: any) => {
        const name = basename(f, ".ts");
        const route = (await import(`./${name}`)).default;
        return {
            baseRoute: name,
            route,
        };
    }));