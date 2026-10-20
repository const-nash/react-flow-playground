import { z } from 'zod';

export const CONDITION_MAX_LENGTH = 500;

export const conditionSchema = z.object({
  /** The condition expression; a plain string for now. */
  text: z.string().max(CONDITION_MAX_LENGTH, `Max ${CONDITION_MAX_LENGTH} characters`),
});

export type ConditionData = z.infer<typeof conditionSchema>;
