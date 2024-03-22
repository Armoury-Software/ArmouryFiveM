import { Server_Init, ServerSessionService, ServerVirtualWorldsService } from '@armoury/fivem-framework';
import { Server } from './controllers/server.controller';

Server_Init(Server, ServerVirtualWorldsService, ServerSessionService.withDefaults());
