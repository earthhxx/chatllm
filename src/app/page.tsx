"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message && !file) return;

    // 1️⃣ push user message
    if (message) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
      ]);
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        file ? "/api/upload" : "/api/chat",
        {
          method: "POST",
          headers: file
            ? undefined
            : { "Content-Type": "application/json" },
          body: file
            ? (() => {
                const fd = new FormData();
                fd.append("file", file);
                return fd;
              })()
            : JSON.stringify({ question: message }),
        }
      );

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);

      // 2️⃣ push assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer ||
            data.message ||
            "❌ ไม่มี response จาก AI",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ AI",
        },
      ]);
    } finally {
      setFile(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col px-6">

        <h1 className="mb-6 text-center text-3xl font-semibold">
          Chat with PDF or Text
        </h1>

        {/* 🧠 Chat history */}
        <div className="mb-4 flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "self-end bg-black text-white dark:bg-white dark:text-black"
                  : "self-start bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="self-start rounded-xl bg-zinc-200 px-4 py-2 text-sm dark:bg-zinc-700">
              🤖 กำลังคิด...
            </div>
          )}
        </div>

        {/* 📝 Input */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="พิมพ์คำถาม หรืออัปโหลด PDF..."
            className="mb-3 w-full resize-none rounded-lg bg-transparent p-3 text-sm outline-none"
            rows={3}
          />

          <div className="flex items-center justify-between gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {loading ? "Sending..." : file ? "Upload PDF" : "Send"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
