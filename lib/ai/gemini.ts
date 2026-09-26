const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in environment variables");
}

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  responseMimeType?: "application/json" | "text/plain";
  systemInstruction?: string;
}

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

export async function generateWithGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const models = options.model ? [options.model, ...FALLBACK_MODELS] : FALLBACK_MODELS;
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const body: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            ...(options.responseMimeType && { responseMimeType: options.responseMimeType }),
          },
        };

        if (options.systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: options.systemInstruction }],
          };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.status === 429 || res.status === 503) {
          const waitMs = 2500 * attempt;
          console.warn(`[Gemini ${model}] Rate limit / high demand (${res.status}). Waiting ${waitMs}ms...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        if (res.status === 404) {
          // Model does not exist, switch to next model immediately
          break;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini ${model} error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error(`Empty response from Gemini ${model}`);
        }

        return text;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw lastError ?? new Error("Failed to generate content with Gemini across all model fallbacks");
}
