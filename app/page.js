"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // Image compression
  function resizeAndCompressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(maxWidth / width, maxHeight / height, 1);
        width *= scale; height *= scale;
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
          else reject(new Error("Compression failed"));
        }, "image/jpeg", quality);
      };
      img.onerror = () => reject(new Error("Image load error"));
    });
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await resizeAndCompressImage(file);
    setImage(compressed);
    setImagePreview(URL.createObjectURL(compressed));
  };

  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: input || "📷 Image sent" }]);

    const formData = new FormData();
    formData.append("message", input);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await res.json();

      // Combine reply with OCR & classification
      let fullReply = data.reply || "No response.";
      if (data.ocrText) fullReply += `\n\n📝 OCR: ${data.ocrText}`;
      if (data.imageLabel) fullReply += `\n\n🖼️ Detected: ${data.imageLabel}`;

      setMessages(prev => [...prev, { role: "assistant", content: fullReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error: Unable to process." }]);
    } finally {
      setInput("");
      setImage(null);
      setImagePreview(null);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Multimodal RAG Chatbot</h1>

      <div ref={chatRef} className="w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col space-y-2 max-h-[400px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded-md whitespace-pre-line ${msg.role === "user" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="italic text-gray-400">Processing...</div>}
      </div>

      {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 max-h-40 rounded" />}

      <div className="w-full max-w-lg flex mt-4 space-x-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 rounded-md text-black" placeholder="Type your message..." />
        <input type="file" onChange={handleImageUpload} className="p-2 bg-gray-700 rounded-md" />
        <button onClick={sendMessage} disabled={loading} className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600">
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </main>
  );
}


