import { z } from 'zod';
import { USER_ACTIONS, type TriggerType, type UserAction } from './options';

/** What the node holds while editing; may be incomplete (type picked, action not yet). */
export interface TriggerDraft {
  triggerType: TriggerType | null;
  action: UserAction | null;
}

/** Savable: either nothing configured yet, or a fully configured trigger — never half of one. */
export const triggerSchema = z.discriminatedUnion('triggerType', [
  z.object({ triggerType: z.null(), action: z.null() }),
  z.object({
    triggerType: z.literal('user_action'),
    action: z.enum(USER_ACTIONS, { error: 'Select an action' }),
  }),
]);

export type TriggerData = z.infer<typeof triggerSchema>;
