import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = 5050;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set in .env – Gemini API calls will fail.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

app.use(cors());
app.use(express.json());


const CHAT_ROUTE = '/server/index';

function handleChat(req, res) {
  (async () => {
    try {
      if (!genAI) {
        return res.status(503).json({
          error: 'Chat is temporarily unavailable.',
          hint: 'Set GEMINI_API_KEY in the server .env file and restart the server.',
        });
      }

      const { message } = req.body;
      if (message === undefined || message === null) {
        return res.status(400).json({
          error: 'Bad request: missing message.',
          hint: 'Send a JSON body with { "message": "your text" }.',
        });
      }
      if (typeof message !== 'string') {
        return res.status(400).json({
          error: 'Bad request: message must be a string.',
        });
      }
      if (message.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad request: message cannot be empty.',
        });
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `You are an educational assistant called eduAI. Answer clearly and helpfully.\n\nUser question: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text?.() ?? (response.candidates?.[0]?.content?.parts?.[0]?.text ?? '');

      if (!responseText) {
        return res.status(502).json({
          error: 'Got an empty reply from the AI. Please try again.',
        });
      }

      res.json({ reply: responseText });
    } catch (error) {
      console.error(`Error in ${CHAT_ROUTE}:`, error);

      let status = 500;
      let errorMessage = 'Something went wrong while getting a reply.';

      if (error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('quota') || msg.includes('rate') || msg.includes('resource_exhausted')) {
          status = 429;
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (msg.includes('api key') || msg.includes('invalid') || msg.includes('401')) {
          status = 503;
          errorMessage = 'AI service is misconfigured. Please check the server API key.';
        } else if (msg.includes('network') || msg.includes('econnrefused') || msg.includes('fetch')) {
          status = 503;
          errorMessage = 'Cannot reach the AI service. Please try again later.';
        } else {
          errorMessage += ` ${error.message}`;
        }
      }

      res.status(status).json({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error.stack }),
      });
    }
  })();
}

app.post(CHAT_ROUTE, handleChat);

app.listen(PORT, () => {
  console.log(`eduAI Assistant server listening on http://localhost:${PORT}`);
});


