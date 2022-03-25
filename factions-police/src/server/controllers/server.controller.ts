import { FiveMController } from '@core/decorators/armoury.decorators';
import { ServerFactionController } from '@core/server/server-faction.controller';

@FiveMController()
export class Server extends ServerFactionController {
  public constructor() {
    super();
  }
}
