import { Growth_State, Plant } from '../../shared/models/drugs.model';
import { ClientController } from '../../../../[utils]/client/client.controller';

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
