import { ClientFactionController } from '@core/client/client-faction.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientFactionController {
  public constructor() {
    super();

    this.setupFactionIndividualBlip({
      id: 526,
      color: 0,
      title: 'Police Department',
      pos: [],
    });
  }
}
