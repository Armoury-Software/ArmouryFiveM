import { Inject } from 'injection-js';
import { Controller } from '@armoury/fivem-framework';
import { ServerItemsService } from '@armoury/fivem-roleplay-gamemode';

@Controller()
export class Server {
  public constructor(@Inject(ServerItemsService) private readonly _items: ServerItemsService) {}
}
