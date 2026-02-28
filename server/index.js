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


app.post('/api/chat', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: 'Gemini API not configured on server. Please check your GEMINI_API_KEY in .env file.' 
      });
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid message. Message must be a non-empty string.' });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create the prompt
    const prompt = `You are an educational assistant called eduAI. Answer clearly and helpfully.\n\nUser question: ${message}`;

    // Generate content
    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    

    const responseText = response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Internal server error calling Gemini.';
    if (error.message) {
      errorMessage += ` Details: ${error.message}`;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(PORT, () => {
  console.log(`eduAI Assistant server listening on http://localhost:${PORT}`);
});


