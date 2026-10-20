import type { NodeComponentProps } from '../../core';
import { TextNodeCard } from '../../shared/ui/TextNodeCard';
import { messageSchema, type MessageData } from './schema';

const ACCENT = { border: 'border-slate-300', header: 'text-slate-500' };

export function MessageNode(props: NodeComponentProps<MessageData>) {
  return <TextNodeCard {...props} schema={messageSchema} title="Message" placeholder="Type a message…" accent={ACCENT} />;
}
