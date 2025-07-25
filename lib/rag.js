import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
let vectorStore;
let contextText = "";

async function downloadFile(remotePath, localPath) {
  const { data, error } = await supabase.storage.from("rag-files").download(remotePath);
  if (error) throw new Error(`Error downloading ${remotePath}: ${error.message}`);
  const buffer = await data.arrayBuffer();
  await fs.writeFile(localPath, Buffer.from(buffer));
}

async function downloadTextFile(remotePath) {
  const { data, error } = await supabase.storage.from("rag-files").download(remotePath);
  if (error) throw new Error(`Error downloading ${remotePath}: ${error.message}`);
  const text = await data.text();
  return text;
}

export async function retrieveContext(query) {
  const tempDir = path.join(process.cwd(), "tmp_vector_store");
  await fs.mkdir(tempDir, { recursive: true });

  // Download vector store files once
  if (!vectorStore) {
    await downloadFile("vector_store/hnswlib.index", path.join(tempDir, "hnswlib.index"));
    await downloadFile("vector_store/args.json", path.join(tempDir, "args.json"));
    await downloadFile("vector_store/docstore.json", path.join(tempDir, "docstore.json"));

    vectorStore = await HNSWLib.load(
      tempDir,
      new HuggingFaceTransformersEmbeddings({ modelName: "sentence-transformers/all-MiniLM-L6-v2" })
    );
  }

  // Load context.txt once
  if (!contextText) {
    contextText = await downloadTextFile("data/context.txt");
  }

  // Perform similarity search
  const results = await vectorStore.similaritySearch(query, 3);
  const retrieved = results.map((r) => r.pageContent).join("\n");

  return `${contextText}\n${retrieved}`;
}

