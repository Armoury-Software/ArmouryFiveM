import { Controller, EVENT_DIRECTIONS, EventListener, Export, calculateDistance } from '@armoury/fivem-framework';

@Controller()
export class Client {
  private playerLeftVehicleInterval: string | number | NodeJS.Timeout;
  private playerTowingVehicleInterval: string | number | NodeJS.Timeout;
  private vehicleBeingTowedEntity: number = NaN;

  // TODO: Make this an Injection Token
  private readonly spawnPosition = [247.83297729492188, -343.20001220703125, 44.4615478515625, 0, 0, 158.7401580810547];

  @EventListener({ eventName: 'onClientGameTypeStart', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onStart() {
    console.log('onStart onClientGameTypeStart');
    Cfx.exports['spawnmanager'].setAutoSpawnCallback(() => {
      Cfx.exports['spawnmanager'].spawnPlayer(
        {
          x: this.spawnPosition[0],
          y: this.spawnPosition[1],
          z: this.spawnPosition[2],
          model: 'mp_m_freemode_01',
        },
        () => {
          Cfx.Client.SetEntityRotation(
            Cfx.Client.GetPlayerPed(-1),
            this.spawnPosition[3],
            this.spawnPosition[4],
            this.spawnPosition[5],
            2,
            true
          );
        }
      );
    });

    Cfx.exports['spawnmanager'].setAutoSpawn(true);
    Cfx.exports['spawnmanager'].forceRespawn();
  }

  @EventListener({ eventName: 'gameEventTriggered', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onGameEventTriggered(name: string, ..._args: any[]) {
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

        if (killed === Cfx.Client.GetPlayerPed(-1) && !!didPedDie) {
          Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:onPlayerDeath`);
          Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:onPlayerDeath`);
          Cfx.emit(`authentication:spawn-player`, [-450.3632, -341.0537, 34.50175, 0, 0]);
        }
        break;
      }
      case 'CEventNetworkPlayerEnteredVehicle': {
        const [_playerNetId, vehicleId]: any[] = _args;
        if (_playerNetId === 128) {
          let computedVehicleSeat: number = Cfx.Client.GetSeatPedIsTryingToEnter(Cfx.Client.PlayerPedId());

          if (
            computedVehicleSeat !== -1 &&
            Cfx.Client.GetPedInVehicleSeat(vehicleId, -1) === Cfx.Client.PlayerPedId()
          ) {
            computedVehicleSeat = -1;
          }

          if (computedVehicleSeat !== -1 && Cfx.Client.IsVehicleSeatFree(vehicleId, -1)) {
            setTimeout(() => {
              this.beginInsideVehicleInterval(vehicleId, computedVehicleSeat, true);
            }, 500);
          } else {
            this.beginInsideVehicleInterval(vehicleId, computedVehicleSeat);
          }
        }
      }
    }
  }

  @Export()
  public findNearVehicles(): [number, string][] {
    const vehiclesToReturn: [number, string][] = [];
    const playerPosition = Cfx.Client.GetEntityCoords(Cfx.Client.GetPlayerPed(-1), true);
    let [handle, _entity]: [number, number] = Cfx.Client.FindFirstVehicle(0);

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = Cfx.Client.FindNextVehicle(handle);
      found = f;

      if (Cfx.Client.NetworkDoesEntityExistWithNetworkId(Cfx.Client.NetworkGetNetworkIdFromEntity(entity))) {
        const vehiclePosition: number[] = Cfx.Client.GetEntityCoords(entity, true);
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
            Cfx.Client.VehToNet(entity),
            Cfx.Client.GetDisplayNameFromVehicleModel(Cfx.Client.GetEntityModel(entity)),
          ]);
        }
      }
    }

    Cfx.Client.EndFindObject(handle);

    return vehiclesToReturn;
  }

  private onSecondPassedWhileUsingTowTruck(forceTowedValue?: number): void {
    if (this.playerTowingVehicleInterval) {
      const _vehicleBeingTowedEntity =
        forceTowedValue ??
        Cfx.Client.GetEntityAttachedToTowTruck(Cfx.Client.GetVehiclePedIsIn(Cfx.Client.PlayerPedId(), false));

      if (_vehicleBeingTowedEntity && !this.vehicleBeingTowedEntity) {
        this.vehicleBeingTowedEntity = _vehicleBeingTowedEntity;

        Cfx.TriggerServerEvent(
          `${Cfx.Client.GetCurrentResourceName()}:onPlayerStartTowVehicle`,
          Cfx.Client.NetworkGetNetworkIdFromEntity(_vehicleBeingTowedEntity)
        );
        Cfx.emit(
          `${Cfx.Client.GetCurrentResourceName()}:onPlayerStartTowVehicle`,
          Cfx.Client.NetworkGetNetworkIdFromEntity(_vehicleBeingTowedEntity)
        );
      }

      if (!_vehicleBeingTowedEntity && this.vehicleBeingTowedEntity) {
        Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:onPlayerStopTowVehicle`);
        Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:onPlayerStopTowVehicle`);

        this.vehicleBeingTowedEntity = NaN;
      }
    }
  }

  private beginInsideVehicleInterval(
    vehicleId: number,
    _computedVehicleSeat: number,
    forceRefreshSeat: boolean = false
  ): void {
    let seatPedIsTryingToEnter = _computedVehicleSeat;

    if (forceRefreshSeat) {
      seatPedIsTryingToEnter = Cfx.Client.GetSeatPedIsTryingToEnter(Cfx.Client.PlayerPedId());

      if (seatPedIsTryingToEnter !== -1) {
        seatPedIsTryingToEnter =
          Cfx.Client.GetPedInVehicleSeat(vehicleId, -1) === Cfx.Client.PlayerPedId() ? -1 : seatPedIsTryingToEnter;
      }

      if (seatPedIsTryingToEnter !== -1) {
        seatPedIsTryingToEnter = _computedVehicleSeat;
      }
    }

    Cfx.TriggerServerEvent(
      `${Cfx.Client.GetCurrentResourceName()}:onPlayerEnterVehicle`,
      Cfx.Client.NetworkGetNetworkIdFromEntity(vehicleId),
      seatPedIsTryingToEnter
    );
    Cfx.emit(
      `${Cfx.Client.GetCurrentResourceName()}:onPlayerEnterVehicle`,
      Cfx.Client.NetworkGetNetworkIdFromEntity(vehicleId),
      seatPedIsTryingToEnter
    );

    if (!this.playerLeftVehicleInterval) {
      this.playerLeftVehicleInterval = setInterval(() => this.onSecondPassedWhileStillInVehicle(), 1000);
    }

    const towTruckHashes = [Cfx.Client.GetHashKey('towtruck'), Cfx.Client.GetHashKey('towtruck2')];
    if (!this.playerTowingVehicleInterval && towTruckHashes.includes(Cfx.Client.GetEntityModel(vehicleId))) {
      this.playerTowingVehicleInterval = setInterval(() => this.onSecondPassedWhileUsingTowTruck(), 100);
    }
  }

  private onSecondPassedWhileStillInVehicle(): void {
    if (this.playerLeftVehicleInterval) {
      const lastVehicle: number = Cfx.Client.GetVehiclePedIsIn(Cfx.Client.PlayerPedId(), true);
      if (!Cfx.Client.GetVehiclePedIsIn(Cfx.Client.PlayerPedId(), false)) {
        Cfx.TriggerServerEvent(
          `${Cfx.Client.GetCurrentResourceName()}:onPlayerExitVehicle`,
          Cfx.Client.NetworkGetNetworkIdFromEntity(lastVehicle),
          Cfx.Client.GetLastPedInVehicleSeat(lastVehicle, -1) === Cfx.Client.PlayerPedId()
        );
        Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:onPlayerExitVehicle`);

        clearInterval(this.playerLeftVehicleInterval);
        this.playerLeftVehicleInterval = null;

        if (this.playerTowingVehicleInterval) {
          this.onSecondPassedWhileUsingTowTruck(NaN);
          clearInterval(this.playerTowingVehicleInterval);
          this.playerTowingVehicleInterval = null;
        }
      }
    }
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:update-time` })
  public onClockUpdated(hour: number, minute: number, second: number): void {
    Cfx.Client.NetworkOverrideClockTime(hour, minute, second);
  }
}
