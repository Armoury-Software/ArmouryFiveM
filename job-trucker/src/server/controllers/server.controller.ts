import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerJobController } from '../../../../[utils]/server/server-job.controller';
import { calculateDistance, isPlayerInRangeOfPoint } from '@core/utils';

import {
  Trucker,
  TruckerDeliveryPoint,
  TRUCKER_DELIVERY_TYPE,
} from '@shared/models/delivery-point.model';
import { TRUCKER_DELIVERY_POINTS, TRUCKER_MONEY_GAIN } from '@shared/positions';

@FiveMController()
export class Server extends ServerJobController {
  public constructor() {
    super();
  }

  private truckers: Map<number, Trucker> = new Map<number, Trucker>();
  private savedPositions: Map<number[], TruckerDeliveryPoint> = new Map<
    number[],
    TruckerDeliveryPoint
  >();

  @EventListener({ eventName: `${GetCurrentResourceName()}:quick-start` })
  public onQuickStart(type: string): void {
    const playerPosition: number[] = GetEntityCoords(
      GetPlayerPed(source),
      true
    );

    let randomDeliveryPoint: number[];
    Array.from(this.savedPositions.keys()).forEach((position) => {
      if (
        TRUCKER_DELIVERY_TYPE[type] ===
          this.savedPositions.get(position).type &&
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
      const filteredDeliveryPoints: TruckerDeliveryPoint[] =
        TRUCKER_DELIVERY_POINTS.filter(
          (truckerDeliveryPoint: TruckerDeliveryPoint) =>
            !isPlayerInRangeOfPoint(
              playerPosition[0],
              playerPosition[1],
              playerPosition[2],
              truckerDeliveryPoint.pos[0],
              truckerDeliveryPoint.pos[1],
              truckerDeliveryPoint.pos[2],
              30.0
            ) && truckerDeliveryPoint.type === this.decideDeliveryType(type)
        );
      randomDeliveryPoint =
        filteredDeliveryPoints[
          Math.floor(Math.random() * filteredDeliveryPoints.length)
        ].pos;
      this.savedPositions.set(playerPosition, {
        pos: randomDeliveryPoint,
        type: TRUCKER_DELIVERY_TYPE[type],
      });
    }
    this.truckers.set(source, {
      distance: calculateDistance([
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        randomDeliveryPoint[0],
        randomDeliveryPoint[1],
        randomDeliveryPoint[2],
      ]),
      type: type,
    });
    TriggerClientEvent(
      `${GetCurrentResourceName()}:begin-job`,
      source,
      {
        X: randomDeliveryPoint[0],
        Y: randomDeliveryPoint[1],
        Z: randomDeliveryPoint[2],
      },
      type
    );

    setTimeout(() => {
      this.savedPositions.delete(playerPosition);
    }, 10000);
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:get-job` })
  public onGetJob(): void {
    this.assignJob(source);
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:job-finished` })
  public onFinishedJob(): void {
    const position: number[] = GetEntityCoords(GetPlayerPed(source), true);
    TRUCKER_DELIVERY_POINTS.forEach((deliveryPoint: TruckerDeliveryPoint) => {
      if (
        isPlayerInRangeOfPoint(
          position[0],
          position[1],
          position[2],
          deliveryPoint.pos[0],
          deliveryPoint.pos[1],
          deliveryPoint.pos[2],
          15.0
        )
      ) {
        exports['authentication'].setPlayerInfo(
          source,
          'cash',
          Number(exports['authentication'].getPlayerInfo(source, 'cash')) +
            (Math.floor(
              this.truckers.get(source).distance *
                TRUCKER_MONEY_GAIN[this.truckers.get(source).type]
            ) +
              Math.floor(
                Math.random() *
                  TRUCKER_MONEY_GAIN[this.truckers.get(source).type] *
                  20
              )),
          false
        );
        TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source);
        global.exports['skills'].incrementPlayerSkill(source, 'trucker', 0.05);
        if (this.truckers.has(source)) {
          this.truckers.delete(source);
        }
        return;
      }
    });
  }

  private decideDeliveryType(type: string): number {
    switch (type) {
      case 'OIL':
        return 0;
      case 'ELECTRICITY':
        return 1;
      default:
        return 2;
    }
  }
}
