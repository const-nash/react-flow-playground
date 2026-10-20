import { createIndexedDbRepository, lazyDatabase, type Repository } from '../core/db';
import { flowSchema, type Flow } from './flow';

const getDb = lazyDatabase({
  name: 'react-flow-playground',
  version: 1,
  stores: [{ name: 'flows', keyPath: 'id' }],
});

export const flowRepository: Repository<Flow> = createIndexedDbRepository(getDb, 'flows', { schema: flowSchema });
