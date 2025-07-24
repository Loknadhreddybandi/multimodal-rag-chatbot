# Multimodal RAG Chatbot

A chatbot that processes **text** and **image** inputs using **Retrieval-Augmented Generation (RAG)** with OCR text extraction.  
Backend uses Groq API and Tesseract.js. Frontend is built with React and Next.js, deployable on Vercel.

---

## Features

- Text and image input support
- Client-side image compression and resizing
- Backend OCR with Tesseract.js
- Context-aware chatbot responses via Groq API
- Conversation history with user/assistant roles
- OCR progress display and image preview UI

---

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm (comes with Node.js)
- Groq API key ([sign up here](https://groq.com))

### Setup

```bash
git clone https://github.com/Loknadhreddybandi/multimodal-rag-chatbot.git
cd multimodal-rag-chatbot
npm install

Create a .env.local file in the root with:
    GROQ_API_KEY=your_groq_api_key_here

Run locally
   bash / terminal
    npm run dev

/pages
  ├── index.js        # Frontend UI
  └── /api
      └── chat.js     # Backend API for chat and OCR
/public               # Static files
.env.local            # Env variables (not committed)
package.json          # Dependencies & scripts
README.md             # This file


Deployment
Deploy easily on Vercel by linking your GitHub repo and setting the GROQ_API_KEY env variable.






