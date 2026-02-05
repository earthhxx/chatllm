import type { Buffer } from "buffer";
// pdf-parse@1.1.1 ✔ ถูกตัว
// แต่ ต้อง import core file เท่านั้น
// Turbopack = strict มาก → CLI code = ระเบิด
// CLI = Command Line Interface
// Framework (Next.js + Turbopack) พยายาม import package entry
// แต่ entry ของ pdf-parse ไม่ได้ expose function อย่างเดียว
// มันมี CLI side-effect ติดมาด้วย
// ปัญหานี้เจอบ่อยใน Next 13–16

// ❝ อย่า import package root ถ้ามันมี CLI ❞

// ✅ ห้ามใช้ require("pdf-parse") เด็ดขาด
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse");

export async function parsePdf(buffer: Buffer): Promise<string> {
  console.log("🟢 [parsePdf] start");
  console.log("🟢 [parsePdf] buffer size:", buffer.length);

  if (!buffer || buffer.length === 0) {
    throw new Error("❌ Empty buffer");
  }

  const data = await pdfParse(buffer);

  console.log("🟢 [parsePdf] pages:", data.numpages);
  console.log("🟢 [parsePdf] text length:", data.text.length);

  return data.text;
}
