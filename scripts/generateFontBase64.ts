import fs from 'fs';
import path from 'path';

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'BlissProRegular.otf');
const fontBuffer = fs.readFileSync(fontPath);
const base64 = fontBuffer.toString('base64');

console.log(base64); 