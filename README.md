# EdTech Multimodal RAG Chatbot

A chatbot supporting **text + image inputs** with **RAG (Retrieval-Augmented Generation)** and optional **tool-calling**.

### Features
- Text & Image query support
- Retrieval-Augmented Generation (RAG)
- Tool-calling (e.g., search, UI generation)
- Deployed on Vercel

### Live Demo
[Click here to try the chatbot](https://multimodal-rag-chatbot-7eqp-git-main-loknadh-reddys-projects.vercel.app)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Loknadhreddybandi/edtech-multimodal-chatbot.git
   cd edtech-multimodal-chatbot
2. Install dependencies:
  npm install
3. GROQ_API_KEY=your_key_here
4. Run locally:
   npm run dev

Tech Stack
Next.js + Vercel AI SDK

Groq API

Retrieval-Augmented Generation (RAG)


---

### **Step 3: Finalize Vercel Deployment**
Make sure:
1. **Environment Variables** (like `GROQ_API_KEY`) are set in Vercel:  
   Go to **Vercel Dashboard → Project → Settings → Environment Variables**.
2. **Branch linked**: The Vercel project must be linked to `main` branch of your GitHub repo.  

Run:
```bash
vercel --prod

Step 4: Submission


GitHub Repo: https://github.com/Loknadhreddybandi/edtech-multimodal-chatbot

Live Chatbot URL: https://multimodal-rag-chatbot.vercel.app (or the final prod URL from Step 3)





