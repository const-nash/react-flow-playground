import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 1000;

export const messageSchema = z.object({
  text: z.string().max(MESSAGE_MAX_LENGTH, `Max ${MESSAGE_MAX_LENGTH} characters`),
});

export type MessageData = z.infer<typeof messageSchema>;
