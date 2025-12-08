import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from '@copilotkit/runtime';
  import OpenAI from 'openai';
  import { type NextRequest } from 'next/server';
   
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// CopilotKit's adapter expects a slightly different OpenAI client shape; cast to bypass type mismatch.
const serviceAdapter = new OpenAIAdapter({ openai: openai as unknown as any });
  const runtime = new CopilotRuntime();
   
  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });
   
    return handleRequest(req);
  };
