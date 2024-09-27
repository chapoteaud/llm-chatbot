import { router } from '../trpc';
import { llmRouter } from './llm';

export const appRouter = router({
  llm: llmRouter,
});

export type AppRouter = typeof appRouter;