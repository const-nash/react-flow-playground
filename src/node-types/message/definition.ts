import { defineNodeType } from '../../core';
import { MessageNode } from './MessageNode';
import { messageSchema, type MessageData } from './schema';

export const messageNode = defineNodeType<MessageData>({
  type: 'message',
  label: 'Message',
  role: 'step',
  size: { width: 280, height: 200 },
  schema: messageSchema,
  defaultData: () => ({ text: '' }),
  children: { slots: [{ id: 'next' }] },
  component: MessageNode,
});
