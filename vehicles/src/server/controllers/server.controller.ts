import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import { Vehicle, VehicleExtended } from '@shared/models/vehicle.interface';

import { Player } from '@resources/authentication/src/shared/models/player.model';
import { VEHICLES_DEFAULTS } from '../../../../dealership/src/shared/vehicles.defaults';
import { calculateDistance } from '@core/utils';

@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  private loadedVehicles: Map<number, VehicleExtended> = new Map<
    number,
    VehicleExtended
  >();

  private loadedVehiclesDBIdsWithSpawnedIds: Map<number, number> = new Map();

  public constructor(dbTableName: string) {
    super(dbTableName);

    setTimeout(() => {
      const authenticatedPlayers =
        global.exports['authentication'].getAuthenticatedPlayers(true);

      if (authenticatedPlayers) {
        Object.keys(authenticatedPlayers).forEach((_authenticatedPlayer) => {
          const playerId: number = Number(_authenticatedPlayer);
          const playerData = authenticatedPlayers[_authenticatedPlayer];

          this.onPlayerAuthenticate(playerId, playerData);
        });
      }
    }, 1000);
  }

  @Export()
  public createVehicle(
    modelHash: number,
    ownerServerId: number,
    primaryColor: number,
    secondaryColor: number,
    posX: number,
    posY: number,
    posZ: number,
    posH: number
  ): number {
    const createdVehicle: number = CreateVehicle(
      modelHash,
      posX,
      posY,
      posZ,
      posH,
      true,
      true
    );

    this.createEntity({
      id: 0,
      modelHash,
      owner: Number(
        global.exports['authentication'].getPlayerInfo(ownerServerId, 'id')
      ),
      primaryColor,
      secondaryColor,
      posX,
      posY,
      posZ,
      posH,
      plate: 'ARMOURY',
      locked: false,
      items: [],
    }).then((vehicle: Vehicle) => {
      this.loadVehicle(vehicle, ownerServerId, createdVehicle);
    });

    SetVehicleColours(createdVehicle, primaryColor, secondaryColor);

    return createdVehicle;
  }

  @Export()
  public getVehicleItems(spawnedVehicleId: number): any[] {
    if (this.loadedVehicles.has(spawnedVehicleId)) {
      const vehicleDBId: number = this.loadedVehicles.get(spawnedVehicleId).id;
      const vehicleEntity: Vehicle = this.getEntityByDBId(vehicleDBId);

      return vehicleEntity.items;
    }

    return [];
  }

  @Export()
  public updateVehicleItems(spawnedVehicleId: number, items: any[]): void {
    if (this.loadedVehicles.has(spawnedVehicleId)) {
      const vehicleDBId: number = this.loadedVehicles.get(spawnedVehicleId).id;
      const vehicleEntity: Vehicle = this.getEntityByDBId(vehicleDBId);

      vehicleEntity.items = items;
      this.loadedVehicles.set(spawnedVehicleId, {
        ...this.loadedVehicles.get(spawnedVehicleId),
        items,
      });

      this.saveDBEntityAsync(vehicleDBId);
    }
  }

  @Export()
  public getVehiclesHashesFromArray(vehiclesKeyIds: number[]): number[] {
    return vehiclesKeyIds.map(
      (vehicleKeyId: number) => this.getEntityByDBId(vehicleKeyId).modelHash
    );
  }

  @Export()
  public getVehicleHashKeyFromVehicleDbId(vehicleDbId: number): string {
    const vehicle: Vehicle = this.getEntityByDBId(vehicleDbId);

    if (vehicle) {
      return Array.from(Object.keys(VEHICLES_DEFAULTS)).find(
        (vehicleDefaultKey: string) =>
          GetHashKey(vehicleDefaultKey) === vehicle.modelHash
      );
    }

    return '';
  }

  protected override onBoundEntityDestroyed(
    _entity: Vehicle,
    boundPlayer: number
  ): void {
    this.removeLoadedVehiclesBoundToPlayer(boundPlayer);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:unlock-this-vehicle`,
  })
  public onVehicleShouldUnlockForPlayer(
    personalVehicleNetworkId: number
  ): void {
    const playerId: number = source;
    const [playerX, playerY, playerZ] = GetEntityCoords(GetPlayerPed(playerId));
    const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(
      NetworkGetEntityFromNetworkId(personalVehicleNetworkId)
    );
    const vehicleEntity: number = NetworkGetEntityFromNetworkId(
      personalVehicleNetworkId
    );

    const loadedVehicleKey = Array.from(this.loadedVehicles.keys()).find(
      (vehicleSpawnedId: number) => vehicleSpawnedId === vehicleEntity
    );

    if (
      calculateDistance([
        playerX,
        playerY,
        playerZ,
        vehicleX,
        vehicleY,
        vehicleZ,
      ]) <= 10.0 &&
      loadedVehicleKey &&
      global.exports['authentication']
        .getPlayerInfo(playerId, 'vehiclekeys')
        .includes(this.loadedVehicles.get(loadedVehicleKey)?.id)
    ) {
      this.toggleLockOfThisVehicle(
        NetworkGetEntityFromNetworkId(personalVehicleNetworkId),
        playerId,
        false
      );
    }
  }

  @EventListener()
  public onPlayerEnterVehicle(_vehicleNetworkId: number): void {
    const playerId: number = source;
    const vehicleEntity: number =
      NetworkGetEntityFromNetworkId(_vehicleNetworkId);

    if (this.loadedVehicles.has(vehicleEntity)) {
      const vehicleDBId: number = this.loadedVehicles.get(vehicleEntity).id;

      if (
        this.playerToEntityBindings.has(playerId) &&
        this.playerToEntityBindings.get(playerId).includes(vehicleDBId)
      ) {
        TriggerClientEvent(
          `${GetCurrentResourceName()}:remove-owned-vehicle-cached-position`,
          playerId,
          _vehicleNetworkId
        );
      }
    }
  }

  @EventListener()
  public onPlayerExitVehicle(
    _vehicleNetworkId: number,
    wasDriver: boolean
  ): void {
    const playerId: number = source;
    const vehicleEntity: number =
      NetworkGetEntityFromNetworkId(_vehicleNetworkId);

    if (wasDriver && this.loadedVehicles.has(vehicleEntity)) {
      const vehicleDBId: number = this.loadedVehicles.get(vehicleEntity).id;
      const vehicle: Vehicle = this.getEntityByDBId(vehicleDBId);
      const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(
        vehicleEntity,
        true
      );
      const vehicleH = GetEntityHeading(vehicleEntity);

      vehicle.posX = vehicleX;
      vehicle.posY = vehicleY;
      vehicle.posZ = vehicleZ;
      vehicle.posH = vehicleH;

      this.loadedVehicles.set(vehicleEntity, {
        ...this.loadedVehicles.get(vehicleEntity),
        posX: vehicle.posX,
        posY: vehicle.posY,
        posZ: vehicle.posZ,
        posH: vehicle.posH,
      });

      this.saveDBEntityAsync(vehicleDBId);

      if (
        this.playerToEntityBindings.has(playerId) &&
        this.playerToEntityBindings.get(playerId).includes(vehicleDBId)
      ) {
        TriggerClientEvent(
          `${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,
          playerId,
          _vehicleNetworkId,
          [vehicleX, vehicleY, vehicleZ],
          GetEntityModel(vehicleEntity)
        );
      }
    }
  }

  @EventListener()
  public override onPlayerAuthenticate(playerId: number, player: Player): void {
    super.onPlayerAuthenticate(playerId, player);

    this.loadDBEntityFor(player.id, 'owner', playerId).then(
      (loadedVehicle: Vehicle | Vehicle[]) => {
        if (loadedVehicle) {
          if (Array.isArray(loadedVehicle)) {
            loadedVehicle.forEach((_loadedVehicle: Vehicle) => {
              const spawnedVehicle = this.loadVehicle(_loadedVehicle, playerId);

              setTimeout(() => {
                TriggerClientEvent(
                  `${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,
                  playerId,
                  NetworkGetNetworkIdFromEntity(spawnedVehicle),
                  GetEntityCoords(spawnedVehicle),
                  GetEntityModel(spawnedVehicle)
                );
              }, 5000);
            });
          } else {
            const spawnedVehicle = this.loadVehicle(loadedVehicle, playerId);

            setTimeout(() => {
              TriggerClientEvent(
                `${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,
                playerId,
                NetworkGetNetworkIdFromEntity(spawnedVehicle),
                GetEntityCoords(spawnedVehicle),
                GetEntityModel(spawnedVehicle)
              );
            }, 5000);
          }
        }
      }
    );
  }

  @EventListener()
  public onResourceStop(resourceName: string): void {
    if (resourceName === GetCurrentResourceName()) {
      console.log(
        'Resource stopped. Attempting to remove all loaded vehicles..'
      );
      Array.from(this.loadedVehicles.keys()).forEach(
        (loadedVehicle: number) => {
          this.removeLoadedVehicle(loadedVehicle);
        }
      );
    }
  }

  @Command({ adminLevelRequired: 2 })
  public goToVeh(playerId: number, [_vehicleId]: [number]): void {
    const vehicleId = Number(_vehicleId);

    if (this.loadedVehiclesDBIdsWithSpawnedIds.has(vehicleId)) {
      const playerPed: number = GetPlayerPed(playerId);
      const spawnedVehicleId: number =
        this.loadedVehiclesDBIdsWithSpawnedIds.get(vehicleId);
      const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(
        spawnedVehicleId,
        true
      );

      SetEntityCoords(
        playerPed,
        vehicleX,
        vehicleY,
        vehicleZ,
        true,
        false,
        false,
        false
      );

      for (let i = -1; i <= 6; i++) {
        if (!DoesEntityExist(GetPedInVehicleSeat(spawnedVehicleId, i))) {
          TaskWarpPedIntoVehicle(playerPed, spawnedVehicleId, i);
          break;
        }
      }
    }
  }

  @Command({ adminLevelRequired: 3 })
  public getVeh(playerId: number, [_vehicleId]: [number]): void {
    const vehicleId = Number(_vehicleId);

    if (this.loadedVehiclesDBIdsWithSpawnedIds.has(vehicleId)) {
      const playerPed: number = GetPlayerPed(playerId);
      const spawnedVehicleId: number =
        this.loadedVehiclesDBIdsWithSpawnedIds.get(vehicleId);
      const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, true);

      SetEntityCoords(
        spawnedVehicleId,
        playerX,
        playerY,
        playerZ + 1.0,
        true,
        false,
        false,
        false
      );
    }
  }

  private loadVehicle(
    vehicle: Vehicle,
    ownerServerId: number,
    alreadySpawnedVehicle?: number
  ): number {
    if (vehicle.posX && vehicle.posY && vehicle.posZ) {
      const spawnedVehicle: number = this.addToLoadedVehicles(
        vehicle,
        alreadySpawnedVehicle ||
          CreateVehicle(
            vehicle.modelHash,
            vehicle.posX,
            vehicle.posY,
            vehicle.posZ,
            vehicle.posH,
            true,
            true
          ),
        ownerServerId
      );

      if (!alreadySpawnedVehicle) {
        SetVehicleColours(
          spawnedVehicle,
          vehicle.primaryColor,
          vehicle.secondaryColor
        );

        SetVehicleNumberPlateText(spawnedVehicle, vehicle.plate || 'ARMOURY');
      }

      SetVehicleDoorsLocked(
        alreadySpawnedVehicle ?? spawnedVehicle,
        vehicle.locked ? 2 : 1
      );

      const currentPlayerKeys: number[] = global.exports[
        'authentication'
      ].getPlayerInfo(ownerServerId, 'vehiclekeys');

      global.exports['authentication'].setPlayerInfo(
        ownerServerId,
        'vehiclekeys',
        [
          ...(Array.isArray(currentPlayerKeys) ? currentPlayerKeys : []),
          vehicle.id,
        ].filter(
          (vehicleKey: number, index: number, self: number[]) =>
            self.indexOf(vehicleKey) === index
        )
      );

      return spawnedVehicle;
    }

    return NaN;
  }

  private addToLoadedVehicles(
    vehicle: Vehicle,
    spawnedVehicle: number,
    toPlayerId: number
  ): number {
    this.loadedVehicles.set(spawnedVehicle, {
      ...vehicle,
      instanceId: spawnedVehicle,
      ownerName: GetPlayerName(toPlayerId),
      ownerInstance: toPlayerId,
    });

    this.loadedVehiclesDBIdsWithSpawnedIds.set(vehicle.id, spawnedVehicle);

    return spawnedVehicle;
  }

  private removeLoadedVehiclesBoundToPlayer(boundPlayer: number): void {
    const vehiclesBoundToPlayer: [number, number][] = Array.from(
      this.loadedVehicles.values()
    )
      .filter(
        (vehicle: VehicleExtended) => vehicle.ownerInstance === boundPlayer
      )
      .map((vehicle: VehicleExtended) => [vehicle.instanceId, vehicle.id]);

    vehiclesBoundToPlayer.forEach(
      ([vehicleIdBoundToPlayer, vehicleDBIdBoundToPlayer]: [
        number,
        number
      ]) => {
        if (this.loadedVehicles.has(vehicleIdBoundToPlayer)) {
          this.removeLoadedVehicle(vehicleIdBoundToPlayer);

          this.loadedVehicles.delete(vehicleIdBoundToPlayer);
        }

        if (
          this.loadedVehiclesDBIdsWithSpawnedIds.has(vehicleDBIdBoundToPlayer)
        ) {
          this.loadedVehiclesDBIdsWithSpawnedIds.delete(
            vehicleDBIdBoundToPlayer
          );
        }
      }
    );
  }

  protected toggleLockOfThisVehicle(
    vehicleEntityId: number,
    playerId: number,
    ignoreSQLCommand: boolean = true
  ): void {
    SetVehicleDoorsLocked(
      vehicleEntityId,
      GetVehicleDoorLockStatus(vehicleEntityId) !== 2 ? 2 : 1
    );
    TriggerClientEvent(
      'vehicles:vehicle-should-bleep-lights',
      playerId,
      NetworkGetNetworkIdFromEntity(vehicleEntityId)
    );

    if (!ignoreSQLCommand) {
      const vehicle: Vehicle = this.entities.find(
        (vehicleEntity) =>
          vehicleEntity.id === this.loadedVehicles.get(vehicleEntityId)?.id
      );

      if (vehicle) {
        vehicle.locked = !vehicle.locked;

        this.saveDBEntityAsync(vehicle.id);
      }
    }
  }

  private removeLoadedVehicle(vehicle: number): void {
    if (DoesEntityExist(vehicle)) {
      DeleteEntity(vehicle);

      if (this.loadedVehicles.has(vehicle)) {
        if (
          this.loadedVehiclesDBIdsWithSpawnedIds.has(
            this.loadedVehicles.get(vehicle).id
          )
        ) {
          this.loadedVehiclesDBIdsWithSpawnedIds.delete(
            this.loadedVehicles.get(vehicle).id
          );
        }

        this.loadedVehicles.delete(vehicle);
      }
    } else {
      console.log(
        'attempted to destroy entity',
        vehicle,
        ", but it doesn't exist."
      );
    }
  }
}
