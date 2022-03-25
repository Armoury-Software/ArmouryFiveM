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
          PlayerPedId(),
          Math.floor(GetEntityHealth(PlayerPedId()) - damage)
        );
      }
    );

    onNet('authentication:success', () => {
      SetEntityMaxHealth(PlayerPedId(), 200);
      SetEntityHealth(PlayerPedId(), 200);
    });

    on('armoury:onPlayerDeath', () => {
      setTimeout(() => {
        if (
          GetEntityMaxHealth(PlayerPedId()) !== 200 &&
          !IsEntityDead(PlayerPedId())
        ) {
          SetEntityMaxHealth(PlayerPedId(), 200);
          SetEntityHealth(PlayerPedId(), 200);
        }
      }, 5000);
    });
  }
}
