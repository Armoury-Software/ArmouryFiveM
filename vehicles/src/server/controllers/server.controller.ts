import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import { Vehicle, VehicleExtended } from '@shared/models/vehicle.interface';

import { Player } from '@resources/authentication/src/shared/models/player.model';

@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  private loadedVehicles: Map<number, VehicleExtended> = new Map<
    number,
    VehicleExtended
  >();

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

          global.exports['authentication'].setPlayerInfo(
            playerId,
            'vehiclekeys',
            (Array.isArray(loadedVehicle)
              ? loadedVehicle
              : [loadedVehicle]
            ).map((vehicle: Vehicle) => vehicle.id)
          );
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

  private loadVehicle(vehicle: Vehicle, owner: number): boolean {
    if (vehicle.posX && vehicle.posY && vehicle.posZ) {
      const spawnedVehicle: number = this.addToLoadedVehicles(
        vehicle,
        CreateVehicle(
          vehicle.modelHash,
          vehicle.posX,
          vehicle.posY,
          vehicle.posZ,
          vehicle.posH,
          true,
          true
        ),
        owner
      );

      SetVehicleColours(
        spawnedVehicle,
        vehicle.primaryColor,
        vehicle.secondaryColor
      );

      SetVehicleNumberPlateText(spawnedVehicle, vehicle.plate || 'ARMOURY');
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
