-- เปิด extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ตารางเก็บไฟล์ต้นฉบับ
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mimetype TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ตารางเก็บ chunk + vector
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,

  -- ⚠️ ต้องตรงกับ dimension จาก embedding API
  -- ตอนนี้ใช้ 1536
  embedding VECTOR(1536),

  created_at TIMESTAMP DEFAULT now()
);

-- ❗️แนะนำ: ยังไม่ต้องสร้าง index ตอนข้อมูลน้อย
-- สร้างเมื่อมีข้อมูลหลักพันขึ้นไป
-- CREATE INDEX document_chunks_embedding_idx
-- ON document_chunks
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
