// lib/vector/search.ts
import { db } from "@/lib/db";

export async function similaritySearch(
  embedding: number[],
  limit = 5
) {
  // 🔥 แปลง number[] → vector literal
  const vectorString = `[${embedding.join(",")}]`;

  const res = await db.query(
    `
    SELECT content
    FROM document_chunks
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [vectorString, limit]
  );

  return res.rows.map((r) => ({
    text: r.content,
  }));
}
