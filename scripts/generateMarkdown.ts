import { ProcedureInfo, ProcedureType } from './types.js'

interface MarkdownSection {
    title: string;
    content: string;
}

export function generateMarkdown(routerName: string, procedures: ProcedureInfo[]): string {
    const sections: MarkdownSection[] = [
        generateHeader(routerName),
        generateOverview(routerName, procedures),
        ...procedures.map(generateProcedureSection),
        generateFooter(),
    ];

    return sections.map(section => `${section.title}\n\n${section.content}`).join('\n\n');
}

function generateHeader(routerName: string): MarkdownSection {
    return {
        title: `# ${formatRouterName(routerName)} Router`,
        content: `This documentation describes all the available endpoints in the ${formatRouterName(routerName)} router.`
    };
}

function generateOverview(routerName: string, procedures: ProcedureInfo[]): MarkdownSection {
    return {
        title: '## Overview',
        content: `
The ${formatRouterName(routerName)} router provides the following endpoints:

${generateTableOfContents(procedures)}
    `.trim()
    };
}

function generateProcedureSection(procedure: ProcedureInfo): MarkdownSection {
    return {
        title: `### \`${procedure.name}\``,
        content: `
**Type:** \`${procedure.type}\`

${procedure.description || 'No description provided.'}

${generateInputSection(procedure)}

${generateOutputSection(procedure)}

**Usage Examples:**

${procedure.type === 'query' ? generateQueryExample(procedure) : generateMutationExample(procedure)}
    `.trim()
    };
}

function generateInputSection(procedure: ProcedureInfo): string {
    if (!procedure.input) {
        return '**Input:** None required';
    }

    return `
**Input:**
\`\`\`typescript
${procedure.input}
\`\`\`
  `.trim();
}

function generateOutputSection(procedure: ProcedureInfo): string {
    if (!procedure.output) {
        return '**Returns:** void';
    }

    return `
**Returns:**
\`\`\`typescript
${procedure.output}
\`\`\`
  `.trim();
}

function generateQueryExample(procedure: ProcedureInfo): string {
    return `
#### Client Component
\`\`\`typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const { data, isLoading } = api.${procedure.name}.useQuery(${procedure.exampleInput || ''});

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Use your data here */}</div>;
}
\`\`\`

#### Server Component
\`\`\`typescript
import { api } from "~/trpc/server";

async function MyServerComponent() {
  const data = await api.${procedure.name}.query(${procedure.exampleInput || ''});
  
  return <div>{/* Use your data here */}</div>;
}
\`\`\``;
}

function generateMutationExample(procedure: ProcedureInfo): string {
    return `
#### Client Component
\`\`\`typescript
"use client";
import { api } from "~/trpc/react";

function MyComponent() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const mutation = api.${procedure.name}.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setSuccess("Operation completed successfully!");
      setError(null);
      // Optional: Reset form or perform other actions
    },
    onError: () => {
      setIsLoading(false);
      setError("An error occurred during the operation.");
      setSuccess(null);
    },
  });

  const handleSubmit = (data: ${procedure.input || 'any'}) => {
    setIsLoading(true);
    mutation.mutate(data);
  };

  return (
    <>
      <div className="toast toast-top toast-end">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      {/* Form implementation here */}
    </>
  );
}
\`\`\`

#### With Optimistic Updates
\`\`\`typescript
const utils = api.useUtils();

const mutation = api.${procedure.name}.useMutation({
  onMutate: async (newData) => {
    await utils.${procedure.name}.cancel();
    const previousData = utils.${procedure.name}.getData();

    utils.${procedure.name}.setData(undefined, (old) => {
      // Update logic here
      return old;
    });

    return { previousData };
  },
  onError: (err, newData, context) => {
    utils.${procedure.name}.setData(undefined, context?.previousData);
  },
  onSettled: () => {
    utils.${procedure.name}.invalidate();
  },
});
\`\`\``;
}

function generateTableOfContents(procedures: ProcedureInfo[]): string {
    if (procedures.length === 0) {
        return '| Endpoint | Type | Description |\n|----------|------|-------------|';
    }

    const rows = procedures.map(proc => {
        const description = proc.description?.split('\n')[0] || 'No description provided.';
        return `| \`${proc.name}\` | ${proc.type} | ${description} |`;
    });

    return `| Endpoint | Type | Description |
|----------|------|-------------|
${rows.join('\n')}`;
}

function generateFooter(): MarkdownSection {
    return {
        title: '## Error Handling',
        content: `
All endpoints in this router follow standard error handling practices:

- \`400\` - Bad Request - Invalid input parameters
- \`401\` - Unauthorized - Authentication required
- \`403\` - Forbidden - Insufficient permissions
- \`404\` - Not Found - Resource doesn't exist
- \`500\` - Internal Server Error - Something went wrong on the server

For detailed error handling, wrap your calls in try/catch blocks:

\`\`\`typescript
try {
  const result = await trpc.someEndpoint.query(/* ... */);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // Handle not found error
  }
  // Handle other errors
}
\`\`\`
    `.trim()
    };
}

function formatRouterName(name: string): string {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
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