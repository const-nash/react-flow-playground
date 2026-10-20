import { createRegistry } from '../core';
import { conditionNode } from './condition/definition';
import { finishNode } from './finish/definition';
import { messageNode } from './message/definition';
import { triggerNode } from './trigger/definition';

/** Every node type in the app. Adding a type = a new folder + one entry here. */
export const registry = createRegistry([triggerNode, messageNode, conditionNode, finishNode]);

export const ROOT_TYPE = triggerNode.type;
