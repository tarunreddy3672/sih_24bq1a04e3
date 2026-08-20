import Groq from 'groq-sdk';

let _client = null;

function getClient() {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('<')) return null;
  _client = new Groq({ apiKey });
  return _client;
}

async function withRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      const isRateLimit = e.status === 429 || e.message?.includes('rate limit');
      const isServer    = e.status === 503 || e.message?.includes('Service Unavailable');
      if ((isRateLimit || isServer) && i < retries - 1) {
        await new Promise(r => setTimeout(r, 600 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Groq timeout')), ms)),
  ]);
}

const DEFAULT_MODEL = 'groq/compound';

/**
 * Chat with Groq — drop-in replacement for geminiChat.
 * @param {string} systemPrompt
 * @param {{ role: 'user'|'model', parts: [{text:string}] }[]} history  — prior turns (Gemini format, auto-converted)
 * @param {string} userMessage
 * @param {string} model
 * @returns {Promise<string>}
 */
export async function geminiChat(systemPrompt, history, userMessage, model = DEFAULT_MODEL) {
  const client = getClient();
  if (!client) throw new Error('GROQ_API_KEY not configured');

  // Convert Gemini-format history to OpenAI-style messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts?.[0]?.text ?? '',
    })),
    { role: 'user', content: userMessage },
  ];

  return withRetry(async () => {
    const res = await client.chat.completions.create({ model, messages, max_tokens: 1024 });
    return res.choices[0]?.message?.content ?? '';
  });
}

/**
 * Single-turn generation — drop-in replacement for geminiGenerate.
 * @param {string} prompt
 * @param {string} model
 * @returns {Promise<string>}
 */
export async function geminiGenerate(prompt, model = DEFAULT_MODEL) {
  const client = getClient();
  if (!client) throw new Error('GROQ_API_KEY not configured');

  return withRetry(async () => {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
    });
    return res.choices[0]?.message?.content ?? '';
  });
}

export function geminiAvailable() {
  return getClient() !== null;
}
