import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request) {
  try {
    if (!genAI) {
      return new Response(
        JSON.stringify({
          error:
            'Gemini API not configured on server. Please check your GEMINI_API_KEY in .env file.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid message. Message must be a non-empty string.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an educational assistant called eduAI. Answer clearly and helpfully.\n\nUser question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    return new Response(JSON.stringify({ reply: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    const errorMessage =
      'Internal server error calling Gemini.' +
      (error?.message ? ` Details: ${error.message}` : '');
    return new Response(
      JSON.stringify({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && error?.stack
          ? { details: error.stack }
          : {}),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
