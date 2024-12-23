import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@typescript-eslint/parser';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';
import { generateMarkdown } from './generateMarkdown.js'
import { ProcedureInfo, ProcedureType } from './types.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTERS_DIR = path.join(__dirname, '..', 'src', 'server', 'api', 'routers');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'api');

async function getAllRouterFiles(dir: string): Promise<string[]> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await getAllRouterFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('createTRPCRouter') || content.includes('.procedure')) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

async function main() {
    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    const routerFiles = await getAllRouterFiles(ROUTERS_DIR);

    for (const filePath of routerFiles) {
        console.log(`Processing file: ${filePath}`);
        await generateDocsForRouter(filePath);
    }

    generateMainReadme(routerFiles);
}

function generateDocsForRouter(routerPath: string) {
    const content = fs.readFileSync(routerPath, 'utf-8');
    const ast = parse(content, {
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: {
            jsx: true,
        },
    });

    const procedures: ProcedureInfo[] = [];

    simpleTraverse(ast, {
        enter(node: any) {
            extractProcedures(node, procedures);
        },
    });

    console.log(`Extracted procedures for ${routerPath}:`, procedures);

    const relativePath = path.relative(ROUTERS_DIR, routerPath);
    const routerName = relativePath.replace(/\.[^/.]+$/, '');

    const docsFilePath = path.join(
        DOCS_DIR,
        path.dirname(relativePath),
        `${path.basename(routerName)}.md`
    );

    fs.mkdirSync(path.dirname(docsFilePath), { recursive: true });

    const markdown = generateMarkdown(routerName, procedures);
    fs.writeFileSync(docsFilePath, markdown);
    console.log(`Generated documentation for ${routerPath} at ${docsFilePath}`);
}

function extractProcedures(node: any, procedures: ProcedureInfo[]) {
    // Add debug logging to see what nodes we're processing
    console.log('Processing node type:', node.type);
    
    // Check for router definition - handle both direct calls and assignments
    if (
        (node.type === 'CallExpression' && 
         (node.callee?.property?.name === 'createTRPCRouter' || 
          node.callee?.name === 'createTRPCRouter')) ||
        (node.type === 'VariableDeclarator' && 
         node.init?.callee?.property?.name === 'createTRPCRouter' ||
         node.init?.callee?.name === 'createTRPCRouter')
    ) {
        // Get the router object, handling both direct calls and assignments
        const routerObj = node.type === 'CallExpression' 
            ? node.arguments[0]
            : node.init?.arguments?.[0];

        if (routerObj?.type === 'ObjectExpression') {
            console.log('Router object found:', JSON.stringify(routerObj, null, 2));
            
            routerObj.properties.forEach((prop: any) => {
                if (prop.type === 'Property') {
                    const procedureName = prop.key.name;
                    let procedureType: ProcedureType | undefined;
                    let description = '';
                    let input = '';

                    if (prop.value?.type === 'CallExpression') {
                        const chain = getCallChain(prop.value);
                        console.log(`Procedure chain for ${procedureName}:`, chain);

                        if (chain.includes('query')) {
                            procedureType = 'query';
                        } else if (chain.includes('mutation')) {
                            procedureType = 'mutation';
                        }

                        input = extractInputSchema(prop.value);
                        description = extractDescription(prop);

                        if (procedureName && procedureType) {
                            const procedure: ProcedureInfo = {
                                name: procedureName,
                                type: procedureType,
                                description: description || `${procedureType === 'query' ? 'Retrieves' : 'Updates'} ${formatProcedureName(procedureName)}`,
                                input,
                                output: extractOutputType(prop.value),
                                exampleInput: extractExampleInput(input),
                            };
                            procedures.push(procedure);
                            console.log(`Extracted procedure:`, procedure);
                        }
                    }
                }
            });
        }
    }
}


function extractInputSchema(node: any): string {
    let current = node;
    let inputSchema = '';

    // Walk up the call chain to find the input definition
    while (current?.type === 'CallExpression') {
        if (current.callee?.property?.name === 'input' && current.arguments[0]) {
            inputSchema = extractZodSchema(current.arguments[0]);
            break;
        }
        current = current.callee?.object;
    }

    return inputSchema;
}

function extractZodSchema(node: any): string {
    if (node.type === 'CallExpression') {
        if (node.callee?.object?.name === 'z') {
            const method = node.callee.property.name;
            const args = node.arguments.map((arg: any) => {
                if (arg.type === 'ObjectExpression') {
                    return extractZodObject(arg);
                }
                return 'any';
            }).join(', ');
            return `z.${method}(${args})`;
        }
    } else if (node.type === 'ObjectExpression') {
        return extractZodObject(node);
    }
    return 'unknown';
}

function extractZodObject(node: any): string {
    if (node.type !== 'ObjectExpression') return 'unknown';

    const properties = node.properties.map((prop: any) => {
        const key = prop.key.name;
        let type = 'unknown';

        if (prop.value.type === 'CallExpression') {
            if (prop.value.callee?.object?.name === 'z') {
                type = `z.${prop.value.callee.property.name}()`;
                if (prop.value.callee.property.name === 'object') {
                    type = extractZodObject(prop.value.arguments[0]);
                }
            }
        }

        return `  ${key}: ${type}`;
    });

    return `{\n${properties.join(',\n')}\n}`;
}

function formatProcedureName(name: string): string {
    return name
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
}

function extractExampleInput(inputSchema: string): string {
    if (!inputSchema || inputSchema === 'unknown') return '{}';

    // Create a basic example based on the input schema
    return inputSchema
        .replace(/z\.(string|number|boolean)\(\)/g, (match) => {
            if (match.includes('string')) return '"example"';
            if (match.includes('number')) return '0';
            if (match.includes('boolean')) return 'false';
            return 'null';
        })
        .replace(/z\.array\((.*?)\)/g, '[]')
        .replace(/z\.object\((.*?)\)/g, '{}');
}

function extractOutputType(node: any): string {
    // Look for return type in the procedure chain
    let current = node;
    while (current?.type === 'CallExpression') {
        if (current.callee?.property?.name === 'query' ||
            current.callee?.property?.name === 'mutation') {
            // Try to extract return type from the callback function
            if (current.arguments[0]?.body?.type === 'ArrowFunctionExpression') {
                const returnStatement = findReturnStatement(current.arguments[0].body);
                if (returnStatement) {
                    return inferTypeFromNode(returnStatement.argument);
                }
            }
        }
        current = current.callee?.object;
    }
    return 'unknown';
}

function findReturnStatement(node: any): any {
    if (node.type === 'ReturnStatement') return node;
    if (node.type === 'BlockStatement' && node.body) {
        for (const statement of node.body) {
            const returnStmt = findReturnStatement(statement);
            if (returnStmt) return returnStmt;
        }
    }
    return null;
}

function inferTypeFromNode(node: any): string {
    if (!node) return 'unknown';

    switch (node.type) {
        case 'ArrayExpression':
            return 'array';
        case 'ObjectExpression':
            return 'object';
        case 'Identifier':
            return node.name;
        case 'AwaitExpression':
            return inferTypeFromNode(node.argument);
        default:
            return 'unknown';
    }
}

function getCallChain(node: any): string[] {
    const chain: string[] = [];
    let current = node;

    while (current?.type === 'CallExpression') {
        if (current.callee?.property?.name) {
            chain.push(current.callee.property.name);
        }
        current = current.callee?.object;
    }

    return chain.reverse(); // Reverse to get the chain in correct order
}

function generateMainReadme(routerFiles: string[]) {
    const routerLinks = routerFiles.map(filePath => {
        const relativePath = path.relative(ROUTERS_DIR, filePath);
        const routerName = relativePath.replace(/\.[^/.]+$/, '');
        const displayName = formatRouterName(routerName);

        // Create the correct link path that mirrors the directory structure
        const linkPath = path.join(
            path.dirname(relativePath),
            `${path.basename(routerName)}.md`
        ).replace(/\\/g, '/'); // Ensure forward slashes for URLs

        return `- [${displayName}](./${linkPath})`;
    }).sort();

    const content = `# API Documentation

This documentation covers all the tRPC API endpoints available in the application.

## Available Routers

${routerLinks.join('\n')}

## Getting Started

To use these endpoints, make sure you have the tRPC client properly configured in your application:

\`\`\`typescript
import { createTRPCClient } from '@trpc/client';

const client = createTRPCClient({
  url: 'YOUR_API_URL',
});
\`\`\`

## Authentication

Most endpoints require authentication. Include your session token in the request headers.

## Error Handling

See individual router documentation for specific error handling details.
`;

    fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), content);
}

function extractDescription(node: any): string {
    // Look for JSDoc comment
    const comments = node.leadingComments ||
        node.parent?.leadingComments ||
        node.parent?.parent?.leadingComments;

    if (comments && comments.length > 0) {
        const docComment = comments.find((comment: any) =>
            comment.type === 'CommentBlock' &&
            comment.value.startsWith('*')
        );

        if (docComment) {
            return docComment.value
                .split('\n')
                .map((line: string) => line.trim().replace(/^\* ?/, ''))
                .filter((line: string) => line)
                .join('\n');
        }
    }

    return '';
}

function formatRouterName(name: string): string {
    // Split by directory separator and get the last part
    const parts = name.split(/[/\\]/);
    const baseName = parts[parts.length - 1];

    // Format the name
    return parts
        .map(part => part
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
        )
        .join(' - ');
}

function getProcedureName(node: any): string | undefined {
    // Handle different procedure definition patterns
    if (node.parent?.type === 'AssignmentExpression') {
        return node.parent.left?.property?.name;
    }
    if (node.parent?.type === 'Property') {
        return node.parent.key?.name;
    }
    return node.callee.object?.property?.name;
}

function getProcedureType(node: any): ProcedureType | undefined {
    if (node.callee.property?.name === 'query' || node.parent?.property?.name === 'query') {
        return 'query';
    }
    if (node.callee.property?.name === 'mutation' || node.parent?.property?.name === 'mutation') {
        return 'mutation';
    }
    return undefined;
}

// Run the script
main().catch(console.error); 