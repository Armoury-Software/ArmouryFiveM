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
          PlayerPedId(),
          Math.floor(GetEntityHealth(PlayerPedId()) - damage)
        );
      }
    );

    onNet(
      `${GetCurrentResourceName()}:play-animation`,
      (igObject: igObject) => {
        if (!this.isPlayingAnim && !IsPedInAnyVehicle(PlayerPedId(), true)) {
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
            PlayerPedId(),
            GetPedBoneIndex(
              PlayerPedId(),
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
            GetEntityRotation(PlayerPedId())[0],
            true
          );
          TaskPlayAnim(
            PlayerPedId(),
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
              PlayerPedId(),
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
