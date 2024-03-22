import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientController {
  public constructor() {
    super();

    this.assignListeners();
  }

  private assignListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:apply-player-damage`,
      (damage: number) => {
        SetEntityHealth(
          GetPlayerPed(-1),
          Math.floor(GetEntityHealth(GetPlayerPed(-1)) - damage)
        );
      }
    );

    onNet('authentication:success', () => {
      SetEntityMaxHealth(GetPlayerPed(-1), 200);
      SetEntityHealth(GetPlayerPed(-1), 200);
    });

    on('armoury:onPlayerDeath', () => {
      setTimeout(() => {
        if (
          GetEntityMaxHealth(GetPlayerPed(-1)) !== 200 &&
          !IsEntityDead(GetPlayerPed(-1))
        ) {
          SetEntityMaxHealth(GetPlayerPed(-1), 200);
          SetEntityHealth(GetPlayerPed(-1), 200);
        }
      }, 5000);
    });
  }
}
