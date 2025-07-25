// app/api/chat/route.js
import axios from "axios";
import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag";

const HF_TIMEOUT = 10000; // 10 seconds timeout for Hugging Face calls

export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") || "";
    const image = formData.get("image");

    let ocrText = "";
    let imageLabel = "";

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());

      // OCR with timeout
      try {
        const hfOCR = await axios.post(
          "https://api-inference.huggingface.co/models/microsoft/trocr-base-handwritten",
          buffer,
          {
            headers: { 
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 
              "Content-Type": "application/octet-stream" 
            },
            timeout: HF_TIMEOUT
          }
        );
        ocrText = hfOCR.data?.[0]?.generated_text?.trim() || "";
      } catch (err) {
        console.warn("OCR failed:", err.message);
        ocrText = "";
      }

      // Image classification with timeout
      try {
        const hfImage = await axios.post(
          "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
          buffer,
          {
            headers: { 
              Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 
              "Content-Type": "application/octet-stream" 
            },
            timeout: HF_TIMEOUT
          }
        );
        imageLabel = hfImage.data?.[0]?.label || "";
      } catch (err) {
        console.warn("Image classification failed:", err.message);
        imageLabel = "";
      }
    }

    // Retrieve RAG context
    let context = "";
    try {
      context = await retrieveContext(message);
    } catch (err) {
      console.warn("Context retrieval failed:", err.message);
      context = "";
    }

    // Build prompt
    const combinedPrompt = `
You are an AI assistant. 
${context ? `Context: ${context}` : ""}
${ocrText ? `Extracted Text: ${ocrText}` : ""}
${imageLabel ? `Detected Image: ${imageLabel}` : ""}
User query: ${message}`;

    // Groq API call
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: "llama3-8b-8192", messages: [{ role: "user", content: combinedPrompt }] },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );

    const reply = groqResponse.data.choices?.[0]?.message?.content || "No reply.";
    return NextResponse.json({ reply, ocrText, imageLabel });

  } catch (err) {
    console.error("Fatal error:", err.message);
    return NextResponse.json(
      { reply: "Server error. Try again later.", ocrText: "", imageLabel: "" },
      { status: 500 }
    );
  }
}


