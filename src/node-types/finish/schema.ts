import { z } from 'zod';

/** Nothing to configure (yet). */
export const finishSchema = z.object({});

export type FinishData = z.infer<typeof finishSchema>;
