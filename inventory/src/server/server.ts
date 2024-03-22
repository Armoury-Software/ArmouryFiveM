import { ServerSessionService, ServerTranslateService } from '@armoury/fivem-framework';
import { Server_Init, ServerItemsService } from '@armoury/fivem-roleplay-gamemode';
import { i18n } from '@shared/i18n';
import { SessionItems } from '@shared/models/session-items';

import { Server } from './controllers/server.controller';

Server_Init(
  Server,
  {
    provide: 'translations',
    useValue: i18n,
  },
  ServerTranslateService,
  ServerSessionService.withItems(SessionItems),
  ServerItemsService.withDefaults()
);
