import { Entity } from 'fivem-js';
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
        let object: number = CreateObject(
          action === 'eat' ? 'prop_amb_donut' : 'prop_ecola_can',
          0,
          0,
          0,
          true,
          false,
          false
        );
        let propBone: number = action === 'eat' ? 18905 : 28422; // 6286
        let propPlacement: number[] =
          action == 'eat'
            ? [0.13, 0.05, 0.02, -50.0, 16.0, 60.0]
            : [0.0, 0.0, 0.0, 0.0, 0.0, 130.0]; // [0.12, 0.05, -0.03, 55, 70, 140]

        switch (action) {
          case 'eat': {
            animationDict = IsPedMale(GetPlayerPed(-1))
              ? 'mp_player_inteat@burger'
              : 'amb@code_human_wander_eating_donut@female@idle_a';
            animationName = 'mp_player_int_eat_burger';
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
        AttachEntityToEntity(
          object,
          GetPlayerPed(-1),
          GetPedBoneIndex(GetPlayerPed(-1), propBone),
          propPlacement[0],
          propPlacement[1],
          propPlacement[2],
          propPlacement[3],
          propPlacement[4],
          propPlacement[5],
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
        setTimeout(
          () => {
            StopAnimTask(GetPlayerPed(-1), animationDict, animationName, 2.0);
            this.isPlayingAnim = false;
            DeleteEntity(object);
          },
          action === 'eat' ? 2000 : 5000
        );
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
