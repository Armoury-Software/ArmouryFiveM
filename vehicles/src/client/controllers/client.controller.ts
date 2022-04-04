import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { calculateDistance } from '@core/utils';

@FiveMController()
export class Client extends ClientController {
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

  private registerKeyBindings(): void {
    RegisterCommand(
      '+togglevehiclelock',
      () => {
        const currentFactionVehicleKeysNetworkIds: number[] = <number[]>(
          this.getPlayerInfo('factionnetworkvehiclekeys')
        );
        if (
          Array.isArray(currentFactionVehicleKeysNetworkIds) &&
          currentFactionVehicleKeysNetworkIds?.length
        ) {
          const playerPosition: number[] = GetEntityCoords(PlayerPedId(), true);
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
          }
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

  private getClosestPeds(): number[] {
    let [handle, _entity]: [number, number] = FindFirstPed(0);

    const closestPeds: number[] = [];
    const currentPlayerPosition: number[] = GetEntityCoords(PlayerPedId());

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = FindNextObject(handle);
      found = f;

      if (entity !== PlayerPedId()) {
        let coords = GetEntityCoords(entity, true);
        if (
          calculateDistance([
            currentPlayerPosition[0],
            currentPlayerPosition[1],
            currentPlayerPosition[2],
            coords[0],
            coords[1],
            coords[2],
          ]) < 20.0
        ) {
          closestPeds.push(entity);
        }
      }
    }

    EndFindObject(handle);

    return closestPeds;
  }
}
