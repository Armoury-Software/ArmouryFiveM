import { CarrierDeliveryPoint } from '../../shared/models/delivery-point.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { isPlayerInRangeOfPoint } from '../../../../[utils]/utils';
import { Business } from '../../../../businesses/src/shared/models/business.interface';
import { CARRIER_PICKUP_POINTS, MAX_PLAYER_PACKAGES } from '../../shared/positions';

export class Server extends ServerController {
    public constructor(){
        super();

        this.assignEvents();
    }
    
    private readonly carriers: Map<number, number> = new Map<number, number>();

    private beginRouteForPlayer(playerId: number, shouldSpawnVehicle: boolean): void {
        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(playerId), true);
        const carrierDeliveryPoints: CarrierDeliveryPoint[] = this.getPossibleDeliveryPoints(playerPosition, 15.0);
        const randomDeliveryPoint: number[] = carrierDeliveryPoints[Math.floor(Math.random() * carrierDeliveryPoints.length)].pos;
        
        this.updatePackageUI();

        TriggerClientEvent(
            `${GetCurrentResourceName()}:begin-route`,
            source,
            {
                X: randomDeliveryPoint[0],
                Y: randomDeliveryPoint[1],
                Z: randomDeliveryPoint[2]-1
            },
            shouldSpawnVehicle
        );
    }

    private updatePackageUI(inVehicle: boolean = true): void {
        if (!this.carriers.has(source)) {
            return;
        }

        if (inVehicle) {
            global.exports['armoury-overlay'].setMessage(source, { id: 'carrier-packages', content: 
                this.carriers.get(source) === 0
                ?`You have no packages left. Pick some up from the docks.` 
                :`You have ${this.carriers.get(source)}/${MAX_PLAYER_PACKAGES} packages left.`
            });
        } else {
            global.exports['armoury-overlay'].deleteMessage(source, { id: 'carrier-packages' });
        }
    }

    private getPossibleDeliveryPoints(referencePosition?: number[], minimumDistance?: number): CarrierDeliveryPoint[] {
        const deliveryPoints: CarrierDeliveryPoint[] =
            global.exports['businesses'].getEntities()
                .map((business: Business) => ({ pos: [business.depositX, business.depositY, business.depositZ] }));

        if (!referencePosition || !minimumDistance) {
            return deliveryPoints;
        }

        return (
            deliveryPoints
                .filter((deliveryPoint: CarrierDeliveryPoint) =>
                    !isPlayerInRangeOfPoint(referencePosition[0], referencePosition[1], referencePosition[2], deliveryPoint.pos[0], deliveryPoint.pos[1], deliveryPoint.pos[2], minimumDistance)
                )
        );
    }

    private assignEvents(): void {
        onNet(`${GetCurrentResourceName()}:playerDropped`, () => {
            if (this.carriers.has(source)) {
                this.carriers.delete(source);
            }
        });

        onNet("baseevents:leftVehicle", () => {
            this.updatePackageUI(false);
        });

        onNet("baseevents:enteredVehicle", () => {
	        if(GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source), false)) === GetHashKey('Mule')) {
                this.updatePackageUI();
            }
        });

        onNet(`${GetCurrentResourceName()}:quick-start`, (refill: boolean = false) => {
            this.carriers.set(source, MAX_PLAYER_PACKAGES);
            this.beginRouteForPlayer(source, !refill);
        });

        onNet(`${GetCurrentResourceName()}:get-job`, () => {
            global.exports['authentication'].setPlayerInfo(source, 'job', 'carrier', false);
            TriggerClientEvent('carrier-job:job-assigned', source);
        });
        
        onNet(`${GetCurrentResourceName()}:route-finished`, () => {
            const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);
            this.getPossibleDeliveryPoints().forEach((deliveryPoint: CarrierDeliveryPoint) => {
                if (isPlayerInRangeOfPoint(playerPosition[0], playerPosition[1], playerPosition[2], deliveryPoint.pos[0], deliveryPoint.pos[1], deliveryPoint.pos[2], 10.0)) {
                    if(GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source), false)) === GetHashKey('Mule')){
                        exports['authentication'].setPlayerInfo(source, 'cash', Number(exports['authentication'].getPlayerInfo(source, 'cash')) + (1000 + Math.floor(Math.random() * 1000)), false);
                        global.exports['skills'].incrementPlayerSkill(source, 'carrier', 0.01);
                        this.carriers.set(source, this.carriers.get(source) - 1)
                        
                        if (this.carriers.get(source) === 0) {
                            this.triggerPickup(source);
                        } else {
                            this.beginRouteForPlayer(source, false);
                        }
                        return; 
                    }
                }
            });
        });
    }

    private triggerPickup(source: number): void {
        this.updatePackageUI();
        TriggerClientEvent(
            `${GetCurrentResourceName()}:pickup-route`,
            source,
            {
                X: CARRIER_PICKUP_POINTS.pos[0],
                Y: CARRIER_PICKUP_POINTS.pos[1],
                Z: CARRIER_PICKUP_POINTS.pos[2]
            }
        );
    }
}
