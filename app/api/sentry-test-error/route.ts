import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate different types of backend errors for Sentry testing
  
  console.log('Sentry test API route called - triggering intentional error');
  
  try {
    // Simulate a database connection error
    throw new Error('CherryGifts Chat API: Simulated database connection failure for Sentry testing');
  } catch (error) {
    console.error('Test error triggered:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Test error triggered successfully',
        message: 'This is an intentional error for Sentry MCP testing',
        timestamp: new Date().toISOString(),
        project: 'cherrygifts',
        organization: 'tameshk'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Simulate a chat message processing error
  
  console.log('Sentry test API POST route called');
  
  try {
    const body = await request.json();
    
    // Simulate message validation error
    if (!body.message) {
      throw new Error('CherryGifts Chat: Message content is required');
    }
    
    // Simulate message processing error
    const fakeMessage = null;
    // @ts-ignore - Intentional error for testing
    const processedMessage = fakeMessage.content.trim();
    
    return NextResponse.json({ success: true, processedMessage });
    
  } catch (error) {
    console.error('Chat message processing error:', error);
    
    // This error should be captured by Sentry
    throw new Error('CherryGifts Chat: Failed to process chat message - Sentry test error');
  }
}
