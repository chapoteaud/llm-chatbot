import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { callOpenAI, callAnthropic, callCohere } from '../llm-providers';

const LLM_PROVIDERS = ['GPT-3.5', 'GPT-4', 'Claude', 'Cohere'] as const;

export const llmRouter = router({
  getProviders: publicProcedure.query(() => {
    return LLM_PROVIDERS;
  }),
  
  chat: publicProcedure
    .input(z.object({
      provider: z.enum(LLM_PROVIDERS),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { provider, message } = input;

      try {
        let content: string;
        switch (provider) {
          case 'GPT-3.5':
            content = await callOpenAI(message, 'gpt-3.5-turbo');
            break;
          case 'GPT-4':
            content = await callOpenAI(message, 'gpt-4');
            break;
          case 'Claude':
            content = await callAnthropic(message);
            break;
          case 'Cohere':
            content = await callCohere(message);
            break;
          default:
            throw new Error(`Unsupported provider: ${provider}`);
        }
        return { content };
      } catch (error) {
        console.error(`Error calling ${provider}:`, error);
        throw new Error(`Failed to get response from ${provider}`);
      }
    }),
});