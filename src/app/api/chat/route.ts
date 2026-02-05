// api/chat/route.ts
import { NextResponse } from "next/server";
import { embedText } from "@/lib/vector/embed";
import { similaritySearch } from "@/lib/vector/search";
import { sendToLLM } from "@/lib/llm/sendToLLM";
import { chunkText } from "@/lib/text/chunkText";

// question จาก user
//  ├─ ถ้าสั้น → embed ตรง
//  └─ ถ้ายาว → chunk → embed หลายอัน
//         ↓
//  similarity search (หลายรอบ)
//         ↓
//  รวม context ที่ไม่ซ้ำ
//         ↓
//  sendToLLM

const MAX_DIRECT_EMBED_LENGTH = 1000;

export async function POST(req: Request) {
  const { question } = await req.json();

  // console.log(question)

  if (!question || typeof question !== "string") {
    return NextResponse.json(
      { error: "Question required" },
      { status: 400 }
    );
  }

  // 1️⃣ เตรียม text สำหรับ embed
  //  chunk type is arr []
  const chunks =
    question.length <= MAX_DIRECT_EMBED_LENGTH
      ? [question]
      : chunkText(question);

  // 2️⃣ embed ทุก chunk
  //   [
  //   Promise<number[]>,
  //   Promise<number[]>,
  //   Promise<number[]>
  // ]
  //   vectors: number[][]
  //   [
  //   [0.01, -0.02, ..., 0.003], // vector ของ chunk 1
  //   [0.11,  0.07, ..., 0.92 ], // vector ของ chunk 2
  //   [0.44, -0.12, ..., 0.18 ]  // vector ของ chunk 3
  // ]
  const vectors = await Promise.all(
    chunks.map((text) => embedText(text))
  );

  //top-k = เลือก “K ชิ้นที่ใกล้ที่สุด / เกี่ยวข้องที่สุด similaritySearch(vector, top-k คือ 5))”
  // 3️⃣ similarity search ทุก vectors [][] .map (vector [0]++)
  const searchResults = await Promise.all(
    vectors.map((vector) => similaritySearch(vector, 10))
  );

  // 4️⃣ รวมผล + ตัดซ้ำ (กัน context ซ้ำ)
  //res.rows
  //   [
  //   { content: "เอกสารนี้พูดถึงระบบบัญชี..." },
  //   { content: "ขั้นตอนการสมัครสมาชิก..." },
  //   { content: "การติดตั้งโปรแกรม..." }
  // ]

  //uniqueChunks เอาไว้เก็บของไม่ซ้ำ
  //   {
  //   "chunk A" => { text: "chunk A", score: 0.92 },
  //   "chunk B" => { text: "chunk B", score: 0.88 },
  //   "chunk C" => { text: "chunk C", score: 0.81 }
  // }
  const uniqueChunks = new Map<string, { text: string; score?: number }>();

  //หลุป [] of [] หาใน arr รวมของ chunk in search 
  for (const results of searchResults) {
    for (const r of results) {
      if (typeof r === "string") {
        uniqueChunks.set(r, { text: r });
      } else if (r?.text) {
        uniqueChunks.set(r.text, r);
      }
    }
  }


  //ดึง เฉพาะ value ของ Map แปลงจาก Map → Array
  //ได้ format ตรงที่ LLM ต้องการ (string[])
  const contextChunks = Array.from(uniqueChunks.values())
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5) //เอา แค่ 5 ตัวแรก
    .map((c) => c.text);//แปลง object → เอาเฉพาะ .text

  // console.log(contextChunks);

  // 5️⃣ ส่งให้ LLM
  const result = await sendToLLM({
    prompt: question,
    contextChunks,
  });

  return NextResponse.json({
    answer: result.answer,
    contextUsed: contextChunks.length,
  });
}
