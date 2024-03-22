import { ClientTranslateService } from '@armoury/fivem-framework';
import { Client_Init } from '@armoury/fivem-roleplay-gamemode';
import { i18n } from '@shared/i18n';

import { Client } from './controllers/client.controller';

Client_Init(
  Client,
  {
    provide: 'translations',
    useValue: i18n,
  },
  ClientTranslateService
);
