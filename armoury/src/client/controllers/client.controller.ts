import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { calculateDistance } from '@core/utils';

@FiveMController()
export class Client extends ClientController {
  private playerLeftVehicleInterval: NodeJS.Timer;

  public constructor() {
    super();

    this.assignListeners();
    this.registerGlobalEvents();
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:update-time` })
  public onClockUpdated(hour: number, minute: number, second: number): void {
    NetworkOverrideClockTime(hour, minute, second);
  }

  private assignListeners(): void {
    const spawnPosition = [
      247.83297729492188, -343.20001220703125, 44.4615478515625, 0, 0,
      158.7401580810547,
    ];

    on('onClientGameTypeStart', () => {
      globalThis.exports.spawnmanager.setAutoSpawnCallback(() => {
        globalThis.exports.spawnmanager.spawnPlayer(
          {
            x: spawnPosition[0],
            y: spawnPosition[1],
            z: spawnPosition[2],
            model: 'a_m_m_skater_01',
          },
          () => {
            emit('chat:addMessage', {
              args: ['Welcome to the party!~'],
            });

            SetEntityRotation(
              GetPlayerPed(-1),
              spawnPosition[3],
              spawnPosition[4],
              spawnPosition[5],
              2,
              true
            );
          }
        );
      });

      globalThis.exports.spawnmanager.setAutoSpawn(true);
      globalThis.exports.spawnmanager.forceRespawn();
    });
  }

  private registerGlobalEvents(): void {
    on('gameEventTriggered', (name: string, _args: any[]) => {
      console.log(name);
      switch (name) {
        case 'CEventNetworkEntityDamage': {
          const [
            killed,
            killer,
            unknown1,
            unknown2,
            unknown3,
            didPedDie,
            weaponHash,
            unknown4,
            unknown5,
            unknown6,
            unknown7,
            didPedHitParkedCar,
            unknown8,
          ]: any[] = _args;

          if (killed === GetPlayerPed(-1) && !!didPedDie) {
            TriggerServerEvent(`${GetCurrentResourceName()}:onPlayerDeath`);
            emit(`${GetCurrentResourceName()}:onPlayerDeath`);
            emit(`authentication:spawn-player`, [-450.3632, -341.0537, 34.50175]);
          }
          break;
        }
        case 'CEventNetworkPlayerEnteredVehicle': {
          const [_playerNetId, vehicleId]: any[] = _args;
          if (_playerNetId === 128) {
            TriggerServerEvent(
              `${GetCurrentResourceName()}:onPlayerEnterVehicle`,
              NetworkGetNetworkIdFromEntity(vehicleId),
              GetSeatPedIsTryingToEnter(PlayerPedId())
            );
            emit(
              `${GetCurrentResourceName()}:onPlayerEnterVehicle`,
              NetworkGetNetworkIdFromEntity(vehicleId),
              GetSeatPedIsTryingToEnter(PlayerPedId())
            );

            if (!this.playerLeftVehicleInterval) {
              this.playerLeftVehicleInterval = setInterval(
                () => this.onSecondPassedWhileStillInVehicle(),
                1000
              );
            }
          }
        }
      }
    });
  }

  @Export()
  public findNearVehicles(): [number, string][] {
    const vehiclesToReturn: [number, string][] = [];
    const playerPosition = GetEntityCoords(GetPlayerPed(-1), true);
    let [handle, _entity]: [number, number] = FindFirstVehicle(0);

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = FindNextVehicle(handle);
      found = f;

      if (
        NetworkDoesEntityExistWithNetworkId(
          NetworkGetNetworkIdFromEntity(entity)
        )
      ) {
        const vehiclePosition: number[] = GetEntityCoords(entity, true);
        if (
          calculateDistance([
            playerPosition[0],
            playerPosition[1],
            playerPosition[2],
            vehiclePosition[0],
            vehiclePosition[1],
            vehiclePosition[2],
          ]) < 3.5
        ) {
          vehiclesToReturn.push([
            VehToNet(entity),
            GetDisplayNameFromVehicleModel(GetEntityModel(entity)),
          ]);
        }
      }
    }

    EndFindObject(handle);

    return vehiclesToReturn;
  }

  private onSecondPassedWhileStillInVehicle(): void {
    if (this.playerLeftVehicleInterval) {
      if (!GetVehiclePedIsIn(PlayerPedId(), false)) {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:onPlayerExitVehicle`,
          NetworkGetNetworkIdFromEntity(GetVehiclePedIsIn(PlayerPedId(), true))
        );
        emit(`${GetCurrentResourceName()}:onPlayerExitVehicle`);

        clearInterval(this.playerLeftVehicleInterval);
        this.playerLeftVehicleInterval = null;
      }
    }
  }
}
