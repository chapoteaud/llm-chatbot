export interface LLMConfig {
    name: string;
    endpoint: string;
    endpointTemplate: {
      model: string;
      messages: Array<{
        role: string;
        content: string;
      }>;
      [key: string]: any; // This allows for additional properties in the template
    };
    apiKeyName: string;
  }
  
  export const llmConfigs: LLMConfig[] = [
    {
      name: 'GPT-3.5',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      endpointTemplate: {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          }
        ]
      },
      apiKeyName: 'OPENAI_API_KEY'
    },
    // Add more LLM configurations here
  ];