// scripts/buildVectorStore.js
import fs from "fs";
import path from "path";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

const docs = [
  "Welcome to iGebra AI. We provide AI-powered education solutions.",
  "This chatbot can answer questions related to EdTech, AI, and iGebra products.",
  "Contact us at info@igebra.ai for more details."
];

async function buildVectorStore() {
  const dir = path.resolve("vector_store");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "sentence-transformers/all-MiniLM-L6-v2"
  });

  const vectorStore = await HNSWLib.fromTexts(
    docs,
    docs.map((_, i) => ({ id: i })),
    embeddings
  );

  await vectorStore.save(dir);
  console.log("✅ Vector store built at:", dir);
}

buildVectorStore().catch((err) => console.error("❌ Build failed:", err));


