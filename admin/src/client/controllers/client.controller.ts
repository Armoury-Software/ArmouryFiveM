import { ClientController } from '../../../../[utils]/client/client.controller';
import { Delay } from '../../../../[utils]/utils';

export class Client extends ClientController {
  public constructor() {
    super();

    this.assignCommands();
  }

  private assignCommands(): void {
    // TODO: REMOVE FOLLOWING !!!
    setTick(async () => {
      NetworkOverrideClockTime(12, 0, 0);
      await Delay(10000);
    });
  }
}
