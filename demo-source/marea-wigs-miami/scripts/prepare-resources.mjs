import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const resources = fileURLToPath(new URL('../../../public/demos/marea-wigs-miami/resources/', import.meta.url));
const target = fileURLToPath(new URL('../public/resources/', import.meta.url));
if (!existsSync(resources)) throw new Error('Missing canonical Marea image resources.');
mkdirSync(target, { recursive: true });
cpSync(resources, target, { recursive: true });
