import { ReflectiveInjector } from 'injection-js';
import { Server_Init, ServerEnterableDatabase } from '@armoury/fivem-framework';
import { Business } from '@shared/models/business.interface';
import { Server } from './controllers/server.controller';

Server_Init(
  Server,
  ReflectiveInjector.resolveAndCreate([
    { provide: 'tableName', useValue: 'businesses' },
    { provide: 'loadEverythingAtStart', useValue: true },
    {
      provide: 'Database',
      useFactory: (tableName: string, loadEverythingAtStart: boolean) =>
        new ServerEnterableDatabase<Business>(tableName, loadEverythingAtStart),
      deps: ['tableName', 'loadEverythingAtStart'],
    },
  ])
);
