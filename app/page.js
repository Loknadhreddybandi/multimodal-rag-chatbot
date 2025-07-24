"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  function resizeAndCompressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else reject(new Error("Canvas is empty"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Image load error"));
    });
  }

  const handleImageUpload = async (e) => {
    const originalFile = e.target.files[0];
    if (!originalFile) return;

    try {
      const compressedFile = await resizeAndCompressImage(originalFile);
      setImage(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      setError("Image processing failed: " + error.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    setLoading(true);
    setError("");
    setProgress(0);

    const formData = new FormData();
    formData.append("message", input);
    if (image) formData.append("image", image);

    const newMessages = [...messages, { role: "user", content: input || "📷 Image sent" }];
    setMessages(newMessages);
    setInput("");
    setImage(null);
    setImagePreview(null);

    try {
      const response = await fetch("/api/chat", { method: "POST", body: formData });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid server response: " + text);
      }

      if (!response.ok) throw new Error(data.reply || "Unknown error");

      // Display OCR text if available
      if (data.ocrText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `📝 OCR Extracted Text:\n${data.ocrText}` },
        ]);
      }

      // Display Image Classification if available
      if (data.imageLabel) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `🖼️ Image Classification:\n${data.imageLabel}` },
        ]);
      }

      // Display chatbot reply
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Multimodal RAG Chatbot</h1>

      <div className="w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col space-y-2 overflow-y-auto max-h-[400px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md whitespace-pre-line ${msg.role === "user" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"}`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400 italic">Processing... {progress > 0 && `${progress}%`}</div>}
      </div>

      {isMounted && imagePreview && (
        <div className="mt-2">
          <img src={imagePreview} alt="preview" className="max-h-40 rounded" />
        </div>
      )}

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="w-full max-w-lg flex mt-4 space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-md text-black"
          placeholder="Type your message..."
        />
        <input type="file" onChange={handleImageUpload} className="p-2 bg-gray-700 rounded-md" />
        <button
          onClick={sendMessage}
          className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </main>
  );
}
