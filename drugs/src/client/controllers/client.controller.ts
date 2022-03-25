import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

import { Plant } from '@shared/models/drugs.model';

@FiveMController()
export class Client extends ClientController {
  public constructor() {
    super();
  }

  private readonly plant: Plant[] = [
    {
      id: 0,
      pos: [0, 0, 0],
      seedType: 'marijuana',
      growthState: 0,
    },
  ];
}
