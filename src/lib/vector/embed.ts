// lib/vector/embed.ts

// ส่ง
// {
//   "text": "ข้อความ chunk นี้",
//   "normalize": true
// }

// res
// {
//   "vectors": [
//     [0.0123, -0.4421, 0.9981, ...]
//   ],
//   "model": "text-embedding-3-large",
//   "dim": 1536
// }

// data.json 
// {
//   vectors: number[][],
//   model: string,
//   dim: number
// }
// แต่ return แค่ data.vector [0]
export async function embedText(text: string): Promise<number[]> {
  const baseUrl = process.env.VECTOR_API_URL;
  // console.log(baseUrl);

  if (!baseUrl) {
    throw new Error("VECTOR_API_URL is not defined");
  }

  const res = await fetch(`${baseUrl}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VECTOR_API_KEY}`,
    },
    body: JSON.stringify({
      text,
      normalize: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Vector API error: ${res.status}`);
  }

  const data = await res.json();
  return data.vectors[0];
}
