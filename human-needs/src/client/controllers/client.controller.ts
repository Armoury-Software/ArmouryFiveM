import { ClientController } from '../../../../[utils]/client/client.controller';

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

    onNet(`${GetCurrentResourceName()}:play-animation`, (action: string) => {
      let animationDict: string;
      let animationName: string;
      switch (action) {
        case 'eat': {
          break;
        }
        case 'drink': {
          animationDict = IsPedMale(GetPlayerPed(-1))
            ? 'amb@code_human_wander_drinking@beer@male@base'
            : 'amb@code_human_wander_drinking@beer@female@base';
          animationName = 'static';
          break;
        }
      }
      console.log(animationDict + ' ///// ' + animationName);
      TaskPlayAnim(
        GetPlayerPed(-1),
        animationDict,
        animationName,
        1.0,
        1.0,
        10000,
        -1,
        0.0,
        false,
        false,
        false
      );
    });

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
