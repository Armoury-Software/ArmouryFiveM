import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';
import { igObject } from '@shared/igObject.model';
import { ITEM_MAPPINGS } from '../../../../inventory/src/shared/item-mappings';

@FiveMController()
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

    onNet(
      `${GetCurrentResourceName()}:play-animation`,
      (igObject: igObject) => {
        if (!this.isPlayingAnim && !IsPedInAnyVehicle(GetPlayerPed(-1), true)) {
          let object: number = CreateObject(
            igObject.animationOptions.prop,
            0,
            0,
            0,
            true,
            false,
            false
          );
          RequestAnimDict(igObject.animationDict);
          AttachEntityToEntity(
            object,
            GetPlayerPed(-1),
            GetPedBoneIndex(
              GetPlayerPed(-1),
              igObject.animationOptions.propBone
            ),
            igObject.animationOptions.propPlacement[0],
            igObject.animationOptions.propPlacement[1],
            igObject.animationOptions.propPlacement[2],
            igObject.animationOptions.propPlacement[3],
            igObject.animationOptions.propPlacement[4],
            igObject.animationOptions.propPlacement[5],
            false,
            true,
            true,
            true,
            GetEntityRotation(GetPlayerPed(-1))[0],
            true
          );
          TaskPlayAnim(
            GetPlayerPed(-1),
            igObject.animationDict,
            igObject.animationName,
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
            StopAnimTask(
              GetPlayerPed(-1),
              igObject.animationDict,
              igObject.animationName,
              2.0
            );
            this.isPlayingAnim = false;
            DeleteEntity(object);
          }, igObject.duration);
        }
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
