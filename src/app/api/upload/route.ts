import { NextResponse } from "next/server";
import { parsePdf } from "@/lib/pdf/parsePdf";
import { chunkText } from "@/lib/text/chunkText";
import { embedText } from "@/lib/vector/embed";
import { saveVector } from "@/lib/vector/save";
import { createDocument } from "@/lib/vector/document";

// PDF → vector → DB
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File not found" }, { status: 400 });
  }

  // 1️⃣ แปลงไฟล์เป็น buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // 2️⃣ parse PDF
  const text = await parsePdf(buffer);

  // 3️⃣ chunk text
  const chunks = chunkText(text);

  // 4️⃣ สร้าง document
  const documentId = await createDocument({
    filename: file.name,
    mimetype: file.type,
  });

  // 5️⃣ embed + save แต่ละ chunk
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    const embedding = await embedText(chunk);

    await saveVector({
      documentId, //UUID random
      chunkIndex: i, // ลำดับของ chunk ภายในไฟล์นั้น
      content: chunk, // ข้อความดิบ ๆ ที่ได้จาก PDF เอาไป embeding
      embedding, // vector ที่ emdeding จาก chunk มาแล้ว
    });
  }

  return NextResponse.json({
    message: "Document indexed successfully",
    documentId,
    chunks: chunks.length,
  });
}
