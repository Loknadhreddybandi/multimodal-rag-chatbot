// lib/rag.js
import fs from "fs";
import path from "path";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

let vectorStore;

export async function retrieveContext(query) {
  const dir = path.resolve("vector_store");
  if (!vectorStore) {
    if (!fs.existsSync(dir)) throw new Error("Vector store not built. Run `node scripts/buildVectorStore.js`.");
    vectorStore = await HNSWLib.load(
      dir,
      new HuggingFaceTransformersEmbeddings({ modelName: "sentence-transformers/all-MiniLM-L6-v2" })
    );
  }

  const results = await vectorStore.similaritySearch(query, 3);
  return results.map((r) => r.pageContent).join("\n");
}
