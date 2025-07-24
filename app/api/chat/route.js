import axios from "axios";
import Tesseract from "tesseract.js";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const message = formData.get("message") || "";
    const image = formData.get("image");

    let ocrText = "";
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const result = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log(m) // Shows progress in console
      });
      ocrText = result.data.text;
    }

    const prompt = message + (ocrText ? `\n\nAlso, this text was extracted from the image:\n${ocrText}` : "");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "No reply";
    return NextResponse.json({ reply, ocrText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: "Error: Unable to process." }, { status: 500 });
  }
}

