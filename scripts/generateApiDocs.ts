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
      // Only include files that contain router definitions
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('createTRPCRouter') || content.includes('.procedure')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

async function main() {
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Get all router files recursively
  const routerFiles = await getAllRouterFiles(ROUTERS_DIR);

  // Generate docs for each router
  for (const filePath of routerFiles) {
    await generateDocsForRouter(filePath);
  }

  // Generate main README
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
      // Improve procedure detection
      if (
        node.type === 'CallExpression' &&
        ((node.callee.property?.name === 'query' ||
          node.callee.property?.name === 'mutation') ||
         (node.callee.property?.name === 'procedure' &&
          node.parent?.property?.name === 'query' ||
          node.parent?.property?.name === 'mutation'))
      ) {
        const procedureName = getProcedureName(node);
        const procedureType = getProcedureType(node);
        
        if (procedureName && procedureType) {
          const procedure: ProcedureInfo = {
            type: procedureType,
            name: procedureName,
            description: extractDescription(node),
            input: extractInputType(node),
            output: extractOutputType(node),
            exampleInput: extractExampleInput(node),
          };
          procedures.push(procedure);
        }
      }
    },
  });

  // Get relative path for router name
  const relativePath = path.relative(ROUTERS_DIR, routerPath);
  const routerName = relativePath.replace(/\.[^/.]+$/, '').replace(/[\/\\]/g, '.');
  const markdown = generateMarkdown(routerName, procedures);
  
  // Create subdirectories in docs if needed
  const docsFilePath = path.join(DOCS_DIR, `${routerName}.md`);
  fs.mkdirSync(path.dirname(docsFilePath), { recursive: true });
  fs.writeFileSync(docsFilePath, markdown);
}

function generateMainReadme(routerFiles: string[]) {
  const content = `# API Documentation

This documentation covers all the tRPC API endpoints available in the application.

## Available Routers

${routerFiles
  .map(file => {
    const name = path.basename(file, '.ts');
    return `- [${formatRouterName(name)}](./${name}.md)`;
  })
  .join('\n')}

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
  const comments = node.parent?.parent?.parent?.comments || node.parent?.parent?.comments || node.parent?.comments;
  
  if (comments && comments.length > 0) {
    const docComment = comments.find((comment: any) => comment.type === 'Block' && comment.value.startsWith('*'));
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

function extractInputType(node: any): string {
  // Implementation to extract input type information
  return '';
}

function extractOutputType(node: any): string {
  // Implementation to extract output type information
  return '';
}

function extractExampleInput(node: any): string {
  // Implementation to extract example input from comments or similar
  return '';
}

function formatRouterName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
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