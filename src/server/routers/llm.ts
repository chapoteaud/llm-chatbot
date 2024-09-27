import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { llmConfigs, LLMConfig } from '../../config/llmConfig';

export const llmRouter = router({
  getConfigs: publicProcedure.query(() => {
    return llmConfigs.map(config => ({ name: config.name }));
  }),
  
  chat: publicProcedure
    .input(z.object({
      llmName: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const config = llmConfigs.find(c => c.name === input.llmName);
      if (!config) {
        throw new Error('LLM configuration not found');
      }

      const apiKey = process.env[config.apiKeyName];
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const body = {
        ...config.endpointTemplate,
        messages: [
          ...config.endpointTemplate.messages,
          { role: "user", content: input.message }
        ]
      };

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to get response from LLM');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    })
});