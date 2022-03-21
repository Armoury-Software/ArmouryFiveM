import { ClientController } from '../../../../[utils]/client/client.controller';

export class Client extends ClientController {
  public constructor() {
    super();

    this.assignListeners();
  }

  private assignListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:shouldSprint`,
      (shouldSprint: boolean) => {
        if (shouldSprint) {
          ResetPlayerStamina(source);
        } else {
          console.log(GetPlayerMaxStamina(PlayerId()));
          StatSetInt('MP0_STAMINA', 100, true);
          // SetPlayerMaxStamina(PlayerId(), 0);
          // SetPlayerStamina(PlayerId(), 0);
        }
      }
    );
  }
}
