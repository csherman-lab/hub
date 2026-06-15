const XAI_BASE = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-3-mini";

export function getXaiApiKey(override?: string): string | null {
  return override?.trim() || process.env.XAI_API_KEY?.trim() || null;
}

export interface GrokMessage {
  role: string;
  content?: string | null;
  reasoning_content?: string | null;
  refusal?: string | null;
  tool_calls?: GrokToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface GrokToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export async function verifyXaiKey(apiKey: string) {
  const headers = { Authorization: `Bearer ${apiKey}` };

  const [modelsRes, voicesRes] = await Promise.all([
    fetch(`${XAI_BASE}/models`, { headers }),
    fetch(`${XAI_BASE}/tts/voices`, { headers }),
  ]);

  return {
    chat: modelsRes.ok,
    voice: voicesRes.ok,
  };
}

export async function grokChat(params: {
  apiKey: string;
  systemPrompt: string;
  messages: GrokMessage[];
  model?: string;
  tools?: unknown[];
  maxTokens?: number;
}) {
  const body: Record<string, unknown> = {
    model: params.model || DEFAULT_MODEL,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
    temperature: 0.7,
    max_tokens: params.maxTokens ?? 512,
  };

  if (params.tools?.length) {
    body.tools = params.tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message as GrokMessage;
}

/** Pull displayable text from a Grok message (content, reasoning, or string). */
export function extractGrokContent(
  message: GrokMessage | string | null | undefined,
): string {
  if (!message) return "";
  if (typeof message === "string") return message;
  return (
    message.content?.trim() ||
    message.reasoning_content?.trim() ||
    message.refusal?.trim() ||
    ""
  );
}

export async function* grokChatStream(params: {
  apiKey: string;
  systemPrompt: string;
  messages: GrokMessage[];
  model?: string;
  maxTokens?: number;
}): AsyncGenerator<string> {
  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || DEFAULT_MODEL,
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.messages,
      ],
      temperature: 0.7,
      max_tokens: params.maxTokens ?? 512,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* skip malformed chunks */
      }
    }
  }
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
