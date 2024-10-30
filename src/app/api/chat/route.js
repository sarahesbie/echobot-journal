import { NextResponse } from 'next/server';
import OpenAI from 'openai'; // Updated import for OpenAI v4
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { message, context } = await request.json();

    // Check if message and context are valid
    if (!message || !context) {
      console.error('Invalid input: Message and context are required');
      return NextResponse.json({ error: 'Invalid input: Message and context are required' }, { status: 400 });
    }

    // Log incoming message and context
    console.log('Received message:', message);
    console.log('Received context:', context);

    // Initialize OpenAI API with the API key (v4 format)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure API key is stored in .env.local
    });

    // Call the GPT-4 API with the new v4 method
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Context: ${context}. Question: ${message}` },
      ],
      max_tokens: 150,
    });

    // Access the response text
    const responseText = response.choices[0].message.content.trim();

    // Log the conversation history
    const conversationEntry = {
      timestamp: new Date().toISOString(),
      userMessage: message,
      botResponse: responseText,
    };

    // Write the conversation log to a file
    const logFilePath = path.join(process.cwd(), 'conversation_log.txt');
    const logEntry = JSON.stringify(conversationEntry) + '\n';
    fs.appendFileSync(logFilePath, logEntry);

    return NextResponse.json({ response: responseText });

  } catch (error) {
    // Log the full error stack for detailed debugging
    console.error('Error during API request:', error.message);
    console.error('Stack trace:', error.stack);

    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
