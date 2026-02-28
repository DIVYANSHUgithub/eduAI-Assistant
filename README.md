## eduAI-Assistant

A simple educational AI assistant web app built with **React (frontend)** and a **Node/Express backend** that connects to **Google Gemini API**.

### Tech Stack
- **Frontend**: React + Vite + JavaScript
- **Backend**: Node.js + Express
- **AI**: Google Gemini API (`@google/generative-ai`)

### Prerequisites
- Node.js 18+ installed
- A **Gemini API key** from Google AI Studio

### Setup

1. **Clone / open the project folder**
   - Make sure you are in `eduAI-Assistant` directory.

2. **Install frontend dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../server
   npm install
   ```

4. **Configure environment variables**

   In the `server` folder, create a file named `.env`:

   ```bash
   GEMINI_API_KEY=your_real_api_key_here
   ```

   Do **not** commit this file to source control.

### Running the app in development

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   This will start the API server (default: `http://localhost:5000`).

2. **Start the frontend dev server**

   ```bash
   cd ../client
   npm run dev
   ```

   Open the URL shown in the terminal (usually `http://localhost:5173`).

### Production build (optional)

From the `client` folder:

```bash
npm run build
```

This creates a production build in the `dist` folder.


