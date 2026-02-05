import { db } from "@/lib/db";

export async function saveVector({
  documentId,
  chunkIndex,
  content,
  embedding,
}: {
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}) {
  // 🔑 แปลง number[] → "[0.1,0.2,0.3]"
  const vectorString = `[${embedding.join(",")}]`;

  await db.query(
    `
    INSERT INTO document_chunks
    (document_id, chunk_index, content, embedding)
    VALUES ($1, $2, $3, $4::vector)
    `,
    [documentId, chunkIndex, content, vectorString]
  );
}
