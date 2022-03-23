import { ClientController } from '../../../../[utils]/client/client.controller';

export class Client extends ClientController {
  public constructor() {
    super();

    this.assignListeners();
  }
  private isPlayingAnim: boolean = false;
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
      if (!this.isPlayingAnim && !IsPedInAnyVehicle(GetPlayerPed(-1), true)) {
        let animationDict: string;
        let animationName: string;
        switch (action) {
          case 'eat': {
            break;
          }
          case 'drink': {
            animationDict = IsPedMale(GetPlayerPed(-1))
              ? 'amb@world_human_drinking@beer@male@idle_a'
              : 'amb@world_human_drinking@beer@female@idle_a';
            animationName = 'idle_c';
            break;
          }
        }
        RequestAnimDict(animationDict);
        console.log(animationDict + ' ///// ' + animationName);
        let bottle = CreateObject(
          'prop_ld_flow_bottle',
          0,
          0,
          0,
          true,
          false,
          false
        );
        AttachEntityToEntity(
          bottle,
          GetPlayerPed(-1),
          GetPedBoneIndex(GetPlayerPed(-1), 6286),
          0.12,
          0.05,
          -0.03,
          55,
          70,
          140,
          false,
          true,
          true,
          true,
          GetEntityRotation(GetPlayerPed(-1))[0],
          true
        );
        TaskPlayAnim(
          GetPlayerPed(-1),
          animationDict,
          animationName,
          2.0,
          2.0,
          5000,
          0,
          0,
          false,
          false,
          false
        );
        this.isPlayingAnim = true;
        setTimeout(() => {
          StopAnimTask(GetPlayerPed(-1), animationDict, animationName, 2.0);
          this.isPlayingAnim = false;
          DeleteEntity(bottle);
        }, 5000);
      }
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
