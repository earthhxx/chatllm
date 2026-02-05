import { db } from "@/lib/db";

export async function createDocument({
  filename,
  mimetype,
}: {
  filename: string;
  mimetype: string;
}): Promise<string> {
  const res = await db.query(
    `
    INSERT INTO documents (filename, mimetype)
    VALUES ($1, $2)
    RETURNING id
    `,
    [filename, mimetype]
  );

  return res.rows[0].id;
}
