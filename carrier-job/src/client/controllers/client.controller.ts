import { CARRIER_DELIVERY_POINTS, CARRIER_MARKERS, CARRIER_QUICKSTART_POSITIONS } from '../../shared/positions';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { waitUntilThenDo } from '../../../../[utils]/utils';
import { UIButton } from '../../../../[utils]/models/ui-button.model';

export class Client extends ClientWithUIController {
    public constructor() {
        super();
        
        this.createBlips([
            {...CARRIER_MARKERS.getJobMarker.blip, pos: CARRIER_MARKERS.getJobMarker.pos}
        ]);

        this.createMarkers([
            CARRIER_MARKERS.getJobMarker,
        ]);

        this.createActionPoints(
            {
                pos: CARRIER_MARKERS.getJobMarker.pos,
                action: () => {
                    if (!this.isUIShowing() && !this.isUIOnCooldown()) {
                        this.showCarrierMenu();
                    }
                }
            }
        );

        this.addControllerListeners();
        this.addUIListener('buttonclick');
    }

    protected onIncomingUIMessage(eventName: string, eventData: any): void {
        super.onIncomingUIMessage(eventName, eventData);

        if (eventName === 'buttonclick') {
            const data: { buttonId: number } = eventData;

            switch (data.buttonId) {
                case 0: {
                    TriggerServerEvent(`${GetCurrentResourceName()}:quick-start`, IsPedInAnyVehicle(GetPlayerPed(-1), false));
                    this.hideUI();
                    break;
                }
                case 3: {
                    TriggerServerEvent(`${GetCurrentResourceName()}:get-job`);
                    break;
                }
            }
        }
    }

    private showCarrierMenu(): void {
        this.updateUIData();
        this.showUI();
    }

    private addControllerListeners(): void {
        onNet(`${GetCurrentResourceName()}:pickup-job`, async (deliveryPosition: { X: number, Y: number, Z: number }) => {
            // const checkpoint = CreateCheckpoint(2, deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z, null, null, null, 3, 71, 74, 147, 255, 0);
            // ClearGpsPlayerWaypoint();
            // SetNewWaypoint(deliveryPosition.X, deliveryPosition.Y);
            
            const targetBlip = AddBlipForCoord(deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z)
            SetBlipRoute(targetBlip, true);

            this.createActionPoints(
                {
                    pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
                    action: () => {
                        this.finishDelivery(targetBlip);
                    },
                    once: true
                }
            );

            let _spawnedTruck: number;
            if (!IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
                _spawnedTruck = await this.createVehicleAsync(45.061977386475, CARRIER_QUICKSTART_POSITIONS[0].pos[0], CARRIER_QUICKSTART_POSITIONS[0].pos[1], CARRIER_QUICKSTART_POSITIONS[0].pos[2], 0.0, true, true);
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), _spawnedTruck, -1);
            } else {
                _spawnedTruck = GetVehiclePedIsIn(GetPlayerPed(-1), false);
            }
        });

        onNet(`${GetCurrentResourceName()}:delivery-job`, async (deliveryPosition: { X: number, Y: number, Z: number }) => {
            // const checkpoint = CreateCheckpoint(2, deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z, null, null, null, 3, 71, 74, 147, 255, 0);
            // ClearGpsPlayerWaypoint();
            // SetNewWaypoint(deliveryPosition.X, deliveryPosition.Y);
            
            const targetBlip = AddBlipForCoord(deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z)
            SetBlipRoute(targetBlip, true);

            this.createActionPoints(
                {
                    pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
                    action: () => {
                        this.finishDelivery(targetBlip);
                    },
                    once: true
                }
            );

            let _spawnedTruck: number;
            if (!IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
                _spawnedTruck = await this.createVehicleAsync(45.061977386475, CARRIER_QUICKSTART_POSITIONS[0].pos[0], CARRIER_QUICKSTART_POSITIONS[0].pos[1], CARRIER_QUICKSTART_POSITIONS[0].pos[2], 0.0, true, true);
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), _spawnedTruck, -1);
            } else {
                _spawnedTruck = GetVehiclePedIsIn(GetPlayerPed(-1), false);
            }
        });

        onNet(`${GetCurrentResourceName()}:job-assigned`, () => {
            waitUntilThenDo(
                () => this.getPlayerInfo('job') === 'carrier',
                () => { this.updateUIData(); }
            );
        });
    }

    public onForceShowUI(data: any): void {
        super.onForceShowUI(data);
    }

    public onForceHideUI(): void {
        super.onForceHideUI();
    }

    private updateUIData() {
        const isACarrier: boolean = this.getPlayerInfo('job') === 'carrier';
        SendNuiMessage(JSON.stringify({
            type: 'update',
            title: 'Carrier Job',
            description: 'TODO',
            resource: 'carrier-job',
            buttons: [
                {
                    title: 'Quick start',
                    subtitle: 'Start a quick, random delivery route',
                    icon: 'play_arrow',
                    disabled: !isACarrier,
                    tooltip: !isACarrier ? 'You are not a carrier' : ''
                },
                // {
                //     title: 'Legal delivery',
                //     subtitle: 'Select a legal truck delivery',
                //     icon: 'local_shipping',
                //     disabled: !isATrucker,
                //     tooltip: !isATrucker ? 'You are not a trucker' : ''
                // },
                // {
                //     title: 'Illegal delivery (unavailable)',
                //     subtitle: 'Select an illegal truck delivery',
                //     icon: 'science',
                //     disabled: !isATrucker, // TODO: Also disable if the player doesn't have trucker skill level 5
                //     tooltip: !isATrucker ? 'You are not a trucker' : '' // TODO: Add possible error for skill level < 5
                // },
                {
                    title: !isACarrier ? 'Get employed' : 'Already a carrier',
                    subtitle: !isACarrier ? 'Become a carrier' : 'You are already a carrier',
                    icon: 'badge',
                    unlocked: isACarrier
                }
            ] as UIButton[]
        }));
    }

    private finishDelivery(checkpoint: number): void {
        emitNet(`${GetCurrentResourceName()}:job-finished`);
        DeleteCheckpoint(checkpoint);
        DeleteEntity(GetVehiclePedIsUsing(GetPlayerPed(-1)));
    }
}
