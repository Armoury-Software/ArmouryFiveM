import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { calculateDistance } from '@core/utils';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientController {
  private cachedVehicleNetworkIdsWithInformations: Map<
    number,
    { pos: [number, number, number]; name: string; blipId: number }
  > = new Map();

  public constructor() {
    super();

    this.registerKeyBindings();
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:vehicle-should-bleep-lights`,
  })
  public onVehicleShouldBleepLights(vehicleNetworkId: number): void {
    this.bleepLightsForVehicle(vehicleNetworkId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:remove-owned-vehicle-cached-position`,
  })
  public onShouldRemoveOwnedVehicleCachedPosition(_vehicleNetworkId): void {
    if (this.cachedVehicleNetworkIdsWithInformations.has(_vehicleNetworkId)) {
      this.clearBlip(
        this.cachedVehicleNetworkIdsWithInformations.get(_vehicleNetworkId)
          .blipId
      );
      this.cachedVehicleNetworkIdsWithInformations.delete(_vehicleNetworkId);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,
  })
  public onShouldCacheOwnedVehicleCachedPosition(
    _vehicleNetworkId: number,
    [vehicleX, vehicleY, vehicleZ]: [number, number, number],
    model: number
  ): void {
    if (this.cachedVehicleNetworkIdsWithInformations.has(_vehicleNetworkId)) {
      this.clearBlip(
        this.cachedVehicleNetworkIdsWithInformations.get(_vehicleNetworkId)
          .blipId
      );
    }

    const name = GetDisplayNameFromVehicleModel(model);

    this.cachedVehicleNetworkIdsWithInformations.set(_vehicleNetworkId, {
      pos: [vehicleX, vehicleY, vehicleZ],
      name,
      blipId: this.createBlip({
        id: 225,
        color: 0,
        title: this.translate('your_vehicle', { name }),
        pos: [vehicleX, vehicleY, vehicleZ],
      }),
    });
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+togglevehiclelock',
      () => {
        const currentFactionVehicleKeysNetworkIds: number[] = <number[]>(
          this.getPlayerInfo('factionnetworkvehiclekeys')
        );

        const playerPosition: number[] = GetEntityCoords(PlayerPedId(), true);

        if (
          Array.isArray(currentFactionVehicleKeysNetworkIds) &&
          currentFactionVehicleKeysNetworkIds?.length
        ) {
          const nearestFactionVehicleNetworkId: number =
            currentFactionVehicleKeysNetworkIds.find((fvn: number) => {
              const vehiclePosition: number[] = GetEntityCoords(
                NetworkGetEntityFromNetworkId(fvn),
                true
              );
              return (
                calculateDistance([
                  playerPosition[0],
                  playerPosition[1],
                  playerPosition[2],
                  vehiclePosition[0],
                  vehiclePosition[1],
                  vehiclePosition[2],
                ]) < 10.0
              );
            });

          if (nearestFactionVehicleNetworkId) {
            TriggerServerEvent(
              `factions-${this.getPlayerInfo(
                'factioninternalid'
              )}:unlock-this-vehicle`,
              nearestFactionVehicleNetworkId
            );

            return;
          }
        }

        const closestPersonalVehicleNetworkId: number[] = Array.from(
          this.cachedVehicleNetworkIdsWithInformations.keys()
        )
          .map((vehicleNetworkId) => {
            const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(
              NetworkGetEntityFromNetworkId(vehicleNetworkId)
            );

            return [
              calculateDistance([
                playerPosition[0],
                playerPosition[1],
                playerPosition[2],
                vehicleX,
                vehicleY,
                vehicleZ,
              ]),
              vehicleNetworkId,
            ];
          })
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))?.[0];

        if (closestPersonalVehicleNetworkId) {
          // prettier-ignore
          TriggerServerEvent(`${GetCurrentResourceName()}:unlock-this-vehicle`, closestPersonalVehicleNetworkId[1]);
          return;
        }
      },
      false
    );

    RegisterKeyMapping(
      '+togglevehiclelock',
      'Lock/Unlock vehicle',
      'keyboard',
      'f3'
    );
  }

  private bleepLightsForVehicle(vehicleNetworkId: number): void {
    const vehicleEntityId: number =
      NetworkGetEntityFromNetworkId(vehicleNetworkId);

    RequestAnimDict('amb@code_human_in_car_mp_actions@dance@bodhi@ps@base');
    TaskPlayAnim(
      PlayerPedId(),
      'amb@code_human_in_car_mp_actions@dance@bodhi@ps@base',
      'enter_fp',
      8.0,
      8.0,
      1000,
      0,
      0,
      false,
      false,
      false
    );

    setTimeout(() => {
      StopAnimTask(
        PlayerPedId(),
        'amb@code_human_in_car_mp_actions@dance@bodhi@ps@base',
        'enter_fp',
        2.0
      );
    }, 1000);

    setTimeout(() => {
      const soundId: number = GetSoundId();
      PlaySoundFromEntity(
        soundId,
        'SELECT',
        vehicleEntityId,
        'HUD_MINI_GAME_SOUNDSET',
        true,
        1
      );

      SetVehicleLights(vehicleEntityId, 2);
      setTimeout(() => {
        SetVehicleLights(vehicleEntityId, 1);

        setTimeout(() => {
          SetVehicleLights(vehicleEntityId, 2);

          setTimeout(() => {
            SetVehicleLights(vehicleEntityId, 0);
            StopSound(soundId);
            ReleaseSoundId(soundId);
          }, 200);
        }, 75);
      }, 200);
    }, 500);
  }
}
