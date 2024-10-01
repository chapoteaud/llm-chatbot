import fetch from 'node-fetch';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/complete';
const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';

export async function callOpenAI(message: string, model: 'gpt-3.5-turbo' | 'gpt-4' = 'gpt-3.5-turbo') {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callAnthropic(message: string) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ANTHROPIC_API_KEY!,
    },
    body: JSON.stringify({
      prompt: `Human: ${message}\n\nAssistant:`,
      model: "claude-2",
      max_tokens_to_sample: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.completion;
}

export async function callCohere(message: string) {
  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'command',
      prompt: message,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.generations[0].text;
}