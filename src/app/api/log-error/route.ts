import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const errorDetails = await request.json();
    
    // Log to console for development
    console.error('Client Error:', errorDetails);
    
    // Here you could add additional logging services
    // For example:
    // - Send to a logging service like Sentry
    // - Write to a database
    // - Send an email notification
    // - etc.

    return NextResponse.json({ status: 'logged' }, { status: 200 });
  } catch (error) {
    console.error('Error logging client error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
} 