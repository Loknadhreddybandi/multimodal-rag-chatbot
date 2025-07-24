import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") || "";
    const image = formData.get("image");

    let imageLabel = "";

    // --- Fast Hugging Face Image Classification ---
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      try {
        const hfImage = await axios.post(
          "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
          buffer,
          {
            headers: {
              "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/octet-stream",
            },
          }
        );
        imageLabel = hfImage.data?.[0]?.label || "[Unable to classify image]";
      } catch (e) {
        console.error("Image classification failed:", e);
        imageLabel = "[Classification failed]";
      }
    }

    // Combine text + image label
    const combinedPrompt = `${message}${imageLabel ? `\nDetected Image Content: ${imageLabel}` : ""}`;

    // --- Groq for text response ---
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: combinedPrompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "No reply from AI.";
    return NextResponse.json({ reply, imageLabel });
  } catch (err) {
    console.error("Backend Error:", err);
    return NextResponse.json({ reply: "Error: Unable to process your request." }, { status: 500 });
  }
}

