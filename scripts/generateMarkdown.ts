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

${generateExampleSection(procedure)}
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

function generateExampleSection(procedure: ProcedureInfo): string {
  return `
**Example:**
\`\`\`typescript
${generateExample(procedure)}
\`\`\`
  `.trim();
}

function generateExample(procedure: ProcedureInfo): string {
  const methodType = procedure.type === 'query' ? 'query' : 'mutate';
  const exampleInput = procedure.exampleInput || '{ /* input parameters */ }';
  
  return `// Using React Query hooks
const ${procedure.type === 'query' ? 'result' : 'mutation'} = ${
    procedure.type === 'query' 
      ? `await trpc.${procedure.name}.${methodType}(${exampleInput})`
      : `trpc.${procedure.name}.useMutation()`
  };`;
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