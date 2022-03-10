import { CARRIER_DELIVERY_POINTS, CARRIER_PICKUP_POINTS } from '../../shared/positions';
import { CarrierDeliveryPoint } from '../../shared/models/delivery-point.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { isPlayerInRangeOfPoint } from '../../../../[utils]/utils';

export class Server extends ServerController {
    public constructor(){
        super();

        this.assignEvents();
    }

    private assignEvents(): void {
        onNet(`${GetCurrentResourceName()}:quick-start`, () => {
            const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);
            const filteredDeliveryPoints: CarrierDeliveryPoint[] =
                CARRIER_DELIVERY_POINTS.filter((carrierDeliveryPoint: CarrierDeliveryPoint) => !isPlayerInRangeOfPoint(playerPosition[0], playerPosition[1], playerPosition[2], carrierDeliveryPoint.pos[0], carrierDeliveryPoint.pos[1], carrierDeliveryPoint.pos[2], 30.0));
            const randomDeliveryPoint: number[] = 
                filteredDeliveryPoints[Math.floor(Math.random() * filteredDeliveryPoints.length)].pos;
        
            TriggerClientEvent(
                'trucker-job:pickup-job',
                source,
                {
                    X: randomDeliveryPoint[0],
                    Y: randomDeliveryPoint[1],
                    Z: randomDeliveryPoint[2]
                }
            );
        });
        
        onNet(`${GetCurrentResourceName()}:get-job`, () => {
            global.exports['authentication'].setPlayerInfo(source, 'job', 'trucker', false);
            TriggerClientEvent('trucker-job:job-assigned', source);
        });
        
        onNet(`${GetCurrentResourceName()}:job-finished`, () => {
            const target: number = source;
            const position: number[] = GetEntityCoords(GetPlayerPed(target), true);
        
            CARRIER_DELIVERY_POINTS.forEach((deliveryPoint: CarrierDeliveryPoint) => {
                if (isPlayerInRangeOfPoint(position[0], position[1], position[2], deliveryPoint.pos[0], deliveryPoint.pos[1], deliveryPoint.pos[2], 15.0)) {
                    exports['authentication'].setPlayerInfo(target, 'cash', Number(exports['authentication'].getPlayerInfo(target, 'cash')) + (1000 + Math.floor(Math.random() * 1000)), false);
                    TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, target);
                    return;
                }
            });

            CARRIER_PICKUP_POINTS.forEach((deliveryPoint: CarrierDeliveryPoint) => {
                if (isPlayerInRangeOfPoint(position[0], position[1], position[2], deliveryPoint.pos[0], deliveryPoint.pos[1], deliveryPoint.pos[2], 15.0)) {
                    // haparnam sa pornesc delivery points
                    return;
                }
            });
        });
    }
}
