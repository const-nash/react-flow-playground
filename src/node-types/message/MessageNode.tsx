import type { NodeComponentProps } from '../../core';
import { TextNodeCard } from '../../shared/ui/TextNodeCard';
import { MESSAGE_MAX_LENGTH, type MessageData } from './schema';

const ACCENT = { border: 'border-slate-300', header: 'text-slate-500' };

export function MessageNode(props: NodeComponentProps<MessageData>) {
  return <TextNodeCard {...props} maxLength={MESSAGE_MAX_LENGTH} title="Message" placeholder="Type a message…" accent={ACCENT} />;
}
