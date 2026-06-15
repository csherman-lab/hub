const XAI_BASE = "https://api.x.ai/v1";

export function getXaiApiKey(override?: string): string | null {
  return override?.trim() || process.env.XAI_API_KEY?.trim() || null;
}

export async function grokChat(params: {
  apiKey: string;
  systemPrompt: string;
  messages: { role: string; content: string }[];
  model?: string;
}) {
  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || "grok-3-mini",
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.messages,
      ],
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

export async function grokTts(params: {
  apiKey: string;
  text: string;
  voiceId: string;
  language?: string;
}): Promise<ArrayBuffer> {
  const res = await fetch(`${XAI_BASE}/tts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: params.text.slice(0, 15000),
      voice_id: params.voiceId,
      language: params.language || "en",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok TTS error: ${err}`);
  }

  return res.arrayBuffer();
}
