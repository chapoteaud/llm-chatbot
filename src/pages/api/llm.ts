import { NextApiRequest, NextApiResponse } from 'next';
import { LLMConfig, llmConfigs } from '../../config/llmConfig';

// Helper function to get environment variables
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Handler for OpenAI (including GPT-3.5 and GPT-4)
async function handleOpenAI(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
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
  return data.choices[0].message.content;
}

// Handler for Anthropic (Claude)
async function handleAnthropic(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
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
  return data.completion;
}

// Handler for Llama 2 (Meta)
async function handleLlama2(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
  // Implementation depends on your specific Llama 2 setup
  // This is a placeholder implementation
  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: message,
      max_tokens: 100
    })
  });

  if (!response.ok) {
    throw new Error(`Llama 2 API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.generated_text;
}

// Handler for Mistral 7B
async function handleMistral(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
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
    throw new Error(`Mistral API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Handler for Cohere
async function handleCohere(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      prompt: message,
      max_tokens: 100
    })
  });

  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.generations[0].text;
}

// Handler for Azure OpenAI
async function handleAzureOpenAI(config: LLMConfig, message: string) {
  const apiKey = getEnvVariable(config.apiKeyName);
  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: message }]
    })
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

const providerHandlers: { [key: string]: (config: LLMConfig, message: string) => Promise<string> } = {
  'OpenAI': handleOpenAI,
  'Anthropic': handleAnthropic,
  'Meta': handleLlama2,
  'Mistral AI': handleMistral,
  'Cohere': handleCohere,
  'Azure': handleAzureOpenAI,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { llmName, message } = req.body;

  const config = llmConfigs.find(c => c.name === llmName);
  if (!config) {
    return res.status(400).json({ error: 'Invalid LLM name' });
  }

  const handler = providerHandlers[config.provider];
  if (!handler) {
    return res.status(400).json({ error: 'Unsupported LLM provider' });
  }

  try {
    const response = await handler(config, message);
    res.status(200).json({ content: response });
  } catch (error) {
    console.error('LLM API error:', error);
    res.status(500).json({ error: 'Failed to get response from LLM' });
  }
}