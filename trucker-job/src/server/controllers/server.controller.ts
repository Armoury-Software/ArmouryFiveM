import {
  TruckerDeliveryPoint,
  TRUCKER_DELIVERY_TYPE,
} from '../../shared/models/delivery-point.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { isPlayerInRangeOfPoint } from '../../../../[utils]/utils';
import {
  TRUCKER_DELIVERY_POINTS,
  TRUCKER_MONEY_GAIN,
} from '../../shared/positions';

export class Server extends ServerController {
  public constructor() {
    super();

    this.assignEvents();
  }

  private truckers: { [player: number]: string } = {};
  private savedPositions: Map<number[], TruckerDeliveryPoint> = new Map<
    number[],
    TruckerDeliveryPoint
  >();

  private assignEvents(): void {
    onNet(`${GetCurrentResourceName()}:quick-start`, (type: string) => {
      this.truckers[source] = type;
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

      TriggerClientEvent(
        'trucker-job:begin-job',
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
    });

    onNet(`${GetCurrentResourceName()}:get-job`, () => {
      global.exports['authentication'].setPlayerInfo(
        source,
        'job',
        'trucker',
        false
      );
      TriggerClientEvent('trucker-job:job-assigned', source);
    });

    onNet(`${GetCurrentResourceName()}:job-finished`, () => {
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
              (TRUCKER_MONEY_GAIN[this.truckers[source]] +
                Math.floor(
                  Math.random() * TRUCKER_MONEY_GAIN[this.truckers[source]]
                )),
            false
          );
          TriggerClientEvent(
            `${GetCurrentResourceName()}:force-showui`,
            source
          );
          global.exports['skills'].incrementPlayerSkill(
            source,
            'trucker',
            0.05
          );
          delete this.truckers[source];
          return;
        }
      });
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
