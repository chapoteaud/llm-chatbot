import { LLMConfig } from '../config/llmConfig';

interface LLMResponse {
  content: string;
}

async function callOpenAI(config: LLMConfig, message: string): Promise<LLMResponse> {
  const apiKey = process.env[config.apiKeyName];
  if (!apiKey) {
    throw new Error(`API key not found for ${config.name}`);
  }

  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: message }]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

async function callAnthropic(config: LLMConfig, message: string): Promise<LLMResponse> {
  const apiKey = process.env[config.apiKeyName];
  if (!apiKey) {
    throw new Error(`API key not found for ${config.name}`);
  }

  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      model: config.model,
      prompt: `Human: ${message}\n\nAssistant:`,
      max_tokens_to_sample: 300
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: data.completion };
}

const providerHandlers: { [key: string]: (config: LLMConfig, message: string) => Promise<LLMResponse> } = {
  'OpenAI': callOpenAI,
  'Anthropic': callAnthropic,
  // Add more providers here
};

export async function callLLM(config: LLMConfig, message: string): Promise<LLMResponse> {
  const handler = providerHandlers[config.provider];
  if (!handler) {
    throw new Error(`No handler found for provider: ${config.provider}`);
  }
  return handler(config, message);
}