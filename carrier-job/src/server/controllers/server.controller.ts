import {
  Carrier,
  CarrierDeliveryPoint,
} from '../../shared/models/delivery-point.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import {
  calculateDistance,
  isPlayerInRangeOfPoint,
} from '../../../../[utils]/utils';
import { Business } from '../../../../businesses/src/shared/models/business.interface';
import {
  CARRIER_PICKUP_POINTS,
  MAX_PLAYER_PACKAGES,
} from '../../shared/positions';

export class Server extends ServerController {
  public constructor() {
    super();

    this.assignEvents();
  }

  private readonly carriers: Map<number, Carrier> = new Map<number, Carrier>();
  private savedPositions: Map<number[], CarrierDeliveryPoint> = new Map<
    number[],
    CarrierDeliveryPoint
  >();

  private beginRouteForPlayer(
    playerId: number,
    shouldSpawnVehicle: boolean
  ): void {
    const playerPosition: number[] = GetEntityCoords(
      GetPlayerPed(playerId),
      true
    );
    let randomDeliveryPoint: number[];

    Array.from(this.savedPositions.keys()).forEach((position) => {
      if (
        isPlayerInRangeOfPoint(
          playerPosition[0],
          playerPosition[1],
          playerPosition[2],
          position[0],
          position[1],
          position[2],
          15
        )
      ) {
        randomDeliveryPoint = this.savedPositions.get(position).pos;
      }
    });

    if (!randomDeliveryPoint) {
      const carrierDeliveryPoints: CarrierDeliveryPoint[] =
        this.getPossibleDeliveryPoints(playerPosition, 15.0);
      randomDeliveryPoint =
        carrierDeliveryPoints[
          Math.floor(Math.random() * carrierDeliveryPoints.length)
        ].pos;

      this.savedPositions.set(playerPosition, { pos: randomDeliveryPoint });
    }
    this.carriers.set(source, {
      distance: calculateDistance([
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        randomDeliveryPoint[0],
        randomDeliveryPoint[1],
        randomDeliveryPoint[2],
      ]),
      packages: this.carriers.get(source).packages,
    });
    this.updatePackageUI();

    TriggerClientEvent(
      `${GetCurrentResourceName()}:begin-route`,
      source,
      {
        X: randomDeliveryPoint[0],
        Y: randomDeliveryPoint[1],
        Z: randomDeliveryPoint[2] - 1,
      },
      shouldSpawnVehicle
    );

    setTimeout(() => {
      this.savedPositions.delete(playerPosition);
    }, 10000);
  }

  private updatePackageUI(inVehicle: boolean = true): void {
    if (!this.carriers.has(source)) {
      return;
    }

    if (inVehicle) {
      global.exports['armoury-overlay'].setMessage(source, {
        id: 'carrier-packages',
        content:
          this.carriers.get(source).packages === 0
            ? `You have no packages left. Pick some up from the docks.`
            : `You have ${
                this.carriers.get(source).packages
              }/${MAX_PLAYER_PACKAGES} packages left.`,
      });
    } else {
      global.exports['armoury-overlay'].deleteMessage(source, {
        id: 'carrier-packages',
      });
    }
  }

  private getPossibleDeliveryPoints(
    referencePosition?: number[],
    minimumDistance?: number
  ): CarrierDeliveryPoint[] {
    const deliveryPoints: CarrierDeliveryPoint[] = global.exports['businesses']
      .getEntities()
      .filter(
        (business: Business) =>
          business.depositX !== 0.0 && business.depositY !== 0.0
      )
      .map((business: Business) => ({
        pos: [business.depositX, business.depositY, business.depositZ],
      }));

    if (!referencePosition || !minimumDistance) {
      return deliveryPoints;
    }

    return deliveryPoints.filter(
      (deliveryPoint: CarrierDeliveryPoint) =>
        !isPlayerInRangeOfPoint(
          referencePosition[0],
          referencePosition[1],
          referencePosition[2],
          deliveryPoint.pos[0],
          deliveryPoint.pos[1],
          deliveryPoint.pos[2],
          minimumDistance
        )
    );
  }

  private assignEvents(): void {
    onNet(`${GetCurrentResourceName()}:playerDropped`, () => {
      if (this.carriers.has(source)) {
        this.carriers.delete(source);
      }
    });

    onNet('baseevents:leftVehicle', () => {
      this.updatePackageUI(false);
    });

    onNet('baseevents:enteredVehicle', () => {
      if (
        GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source), false)) ===
        GetHashKey('Mule')
      ) {
        this.updatePackageUI();
      }
    });

    onNet(
      `${GetCurrentResourceName()}:quick-start`,
      (refill: boolean = false) => {
        this.carriers.set(source, {
          distance: 0,
          packages: MAX_PLAYER_PACKAGES,
        });
        this.beginRouteForPlayer(source, !refill);
      }
    );

    onNet(`${GetCurrentResourceName()}:get-job`, () => {
      global.exports['authentication'].setPlayerInfo(
        source,
        'job',
        'carrier',
        false
      );
      TriggerClientEvent('carrier-job:job-assigned', source);
    });

    onNet(`${GetCurrentResourceName()}:route-finished`, () => {
      const playerPosition: number[] = GetEntityCoords(
        GetPlayerPed(source),
        true
      );
      this.getPossibleDeliveryPoints().forEach(
        (deliveryPoint: CarrierDeliveryPoint) => {
          if (
            isPlayerInRangeOfPoint(
              playerPosition[0],
              playerPosition[1],
              playerPosition[2],
              deliveryPoint.pos[0],
              deliveryPoint.pos[1],
              deliveryPoint.pos[2],
              10.0
            )
          ) {
            if (
              GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source), false)) ===
              GetHashKey('Mule')
            ) {
              exports['authentication'].setPlayerInfo(
                source,
                'cash',
                Number(
                  exports['authentication'].getPlayerInfo(source, 'cash')
                ) +
                  (Math.floor(this.carriers.get(source).distance * 0.14) +
                    Math.floor(Math.random() * 100)),
                false
              );
              global.exports['skills'].incrementPlayerSkill(
                source,
                'carrier',
                0.01
              );
              console.log(this.carriers.get(source));
              this.carriers.set(source, {
                distance: 0,
                packages: this.carriers.get(source).packages - 1,
              });

              if (this.carriers.get(source).packages === 0) {
                this.triggerPickup(source);
              } else {
                this.beginRouteForPlayer(source, false);
              }
              return;
            }
          }
        }
      );
    });
  }

  private triggerPickup(source: number): void {
    this.updatePackageUI();
    TriggerClientEvent(`${GetCurrentResourceName()}:pickup-route`, source, {
      X: CARRIER_PICKUP_POINTS.pos[0],
      Y: CARRIER_PICKUP_POINTS.pos[1],
      Z: CARRIER_PICKUP_POINTS.pos[2],
    });
  }
}
