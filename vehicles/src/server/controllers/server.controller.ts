import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import { Vehicle, VehicleExtended } from '@shared/models/vehicle.interface';

import { Player } from '@resources/authentication/src/shared/models/player.model';
import { VEHICLES_DEFAULTS } from '../../../../dealership/src/shared/vehicles.defaults';

@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  private loadedVehicles: Map<number, VehicleExtended> = new Map<
    number,
    VehicleExtended
  >();

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

  @EventListener()
  public override onPlayerAuthenticate(playerId: number, player: Player): void {
    super.onPlayerAuthenticate(playerId, player);

    this.loadDBEntityFor(player.id, 'owner', playerId).then(
      (loadedVehicle: Vehicle | Vehicle[]) => {
        if (loadedVehicle) {
          if (Array.isArray(loadedVehicle)) {
            loadedVehicle.forEach((_loadedVehicle: Vehicle) => {
              this.loadVehicle(_loadedVehicle, playerId);
            });
          } else {
            this.loadVehicle(loadedVehicle, playerId);
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

  private loadVehicle(
    vehicle: Vehicle,
    ownerServerId: number,
    alreadySpawnedVehicle?: number
  ): boolean {
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
    }

    return false;
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

    return spawnedVehicle;
  }

  private removeLoadedVehiclesBoundToPlayer(boundPlayer: number): void {
    const vehiclesBoundToPlayer: number[] = Array.from(
      this.loadedVehicles.values()
    )
      .filter(
        (vehicle: VehicleExtended) => vehicle.ownerInstance === boundPlayer
      )
      .map((vehicle: VehicleExtended) => vehicle.instanceId);

    vehiclesBoundToPlayer.forEach((vehicleBoundToPlayer: number) => {
      if (this.loadedVehicles.has(vehicleBoundToPlayer)) {
        console.log(
          'found vehicle',
          vehicleBoundToPlayer,
          ', attempting to destroy it..'
        );

        this.removeLoadedVehicle(vehicleBoundToPlayer);

        this.loadedVehicles.delete(vehicleBoundToPlayer);
      }
    });
  }

  private removeLoadedVehicle(vehicle: number): void {
    if (DoesEntityExist(vehicle)) {
      DeleteEntity(vehicle);
    } else {
      console.log(
        'attempted to destroy entity',
        vehicle,
        ", but it doesn't exist."
      );
    }
  }
}
