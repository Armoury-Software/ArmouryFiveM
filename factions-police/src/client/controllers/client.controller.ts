import { ClientFactionController } from '../../../../[utils]/client/client-faction.controller';

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
