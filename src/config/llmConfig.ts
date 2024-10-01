export interface LLMConfig {
  name: string;
  provider: string;
  model: string;
  apiEndpoint: string;
  apiKeyName: string;
}

export const llmConfigs: LLMConfig[] = [
  {
    name: 'GPT-3.5',
    provider: 'OpenAI',
    model: "gpt-3.5-turbo",
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKeyName: 'OPENAI_API_KEY'
  },
  {
    name: 'Claude',
    provider: 'Anthropic',
    model: "claude-2",
    apiEndpoint: 'https://api.anthropic.com/v1/complete',
    apiKeyName: 'ANTHROPIC_API_KEY'
  },
  {
    name: 'Llama 2',
    provider: 'Meta',
    model: "llama-2-70b-chat",
    apiEndpoint: 'https://your-llama-2-endpoint.com/generate',
    apiKeyName: 'LLAMA_API_KEY'
  },
  {
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    model: "mistral-7b-instruct",
    apiEndpoint: 'https://your-mistral-endpoint.com/v1/chat/completions',
    apiKeyName: 'MISTRAL_API_KEY'
  },
  {
    name: 'Cohere',
    provider: 'Cohere',
    model: "command",
    apiEndpoint: 'https://api.cohere.ai/v1/generate',
    apiKeyName: 'COHERE_API_KEY'
  },
  {
    name: 'Azure OpenAI',
    provider: 'Azure',
    model: "gpt-4",
    apiEndpoint: 'https://your-azure-openai-endpoint.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2023-05-15',
    apiKeyName: 'AZURE_OPENAI_API_KEY'
  }
];