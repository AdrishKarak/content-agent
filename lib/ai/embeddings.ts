const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate a 1536-dimensional embedding vector using Gemini Embeddings API.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: 1536,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Embedding API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const values: number[] = data.embedding?.values;
  if (!values || values.length !== 1536) {
    throw new Error(`Invalid embedding vector returned (length: ${values?.length})`);
  }

  return values;
}
