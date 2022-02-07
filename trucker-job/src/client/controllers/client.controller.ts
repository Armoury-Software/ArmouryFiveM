import { TRUCKER_MARKERS, TRUCKER_QUICKSTART_POSITIONS } from '../../shared/positions';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { UIButton } from '../../../../[utils]/models/ui-button.model';
import { waitUntilThenDo } from '../../../../[utils]/utils';

export class Client extends ClientWithUIController {
    public constructor() {
        super();

        this.createBlips([
            { ...TRUCKER_MARKERS.getJobMarker.blip, pos: TRUCKER_MARKERS.getJobMarker.pos }
        ]);

        this.createMarkers([
            TRUCKER_MARKERS.getJobMarker,
        ]);

        this.createActionPoints(
            {
                pos: TRUCKER_MARKERS.getJobMarker.pos,
                action: () => {
                    if (!this.isUIShowing() && !this.isUIOnCooldown()) {
                        this.showTruckerMenu();
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

    private showTruckerMenu(): void {
        this.updateUIData();
        this.showUI();
    }

    private addControllerListeners(): void {
        onNet(`${GetCurrentResourceName()}:begin-job`, async (deliveryPosition: { X: number, Y: number, Z: number }) => {
            const checkpoint = CreateCheckpoint(2, deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z, null, null, null, 3, 71, 74, 147, 255, 0);
            ClearGpsPlayerWaypoint();
            SetNewWaypoint(deliveryPosition.X, deliveryPosition.Y);
            
            this.createActionPoints(
                {
                    pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
                    action: () => {
                        this.finishDelivery(checkpoint);
                    },
                    once: true
                }
            );

            let _spawnedTruck: number;
            if (!IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
                _spawnedTruck = await this.createVehicleAsync(1518533038, TRUCKER_QUICKSTART_POSITIONS[0].pos[0], TRUCKER_QUICKSTART_POSITIONS[0].pos[1], TRUCKER_QUICKSTART_POSITIONS[0].pos[2], 0.0, true, true);
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), _spawnedTruck, -1);
            } else {
                _spawnedTruck = GetVehiclePedIsIn(GetPlayerPed(-1), false);
            }
            
            const trailerOffsets: number[] = GetOffsetFromEntityInWorldCoords(_spawnedTruck, 0.0, 8.0, 0.0);
            const spawnedTrailer: number = await this.createVehicleAsync(-730904777, trailerOffsets[0], trailerOffsets[1], trailerOffsets[2], 0, true, true);
            AttachVehicleToTrailer(_spawnedTruck, spawnedTrailer, 100.0);
        });

        onNet(`${GetCurrentResourceName()}:job-assigned`, () => {
            waitUntilThenDo(
                () => this.getPlayerInfo('job') === 'trucker',
                () => { this.updateUIData(); }
            );
        });
    }

    public onForceShowUI(): void {
        this.showTruckerMenu();
    }

    public onForceHideUI(): void {
        super.onForceHideUI();
    }

    private updateUIData(): void {
        const isATrucker: boolean = this.getPlayerInfo('job') === 'trucker';
        SendNuiMessage(JSON.stringify({
            type: 'update',
            title: 'Trucker Job',
            description: 'Truckers deliver international cargo for usage in stores and other local businesses. They also help decentralize traffic outside the main area of influence.',
            resource: 'trucker-job',
            buttons: [
                {
                    title: 'Quick start',
                    subtitle: 'Start a quick, random delivery route',
                    icon: 'play_arrow',
                    disabled: !isATrucker,
                    tooltip: !isATrucker ? 'You are not a trucker' : ''
                },
                {
                    title: 'Legal delivery',
                    subtitle: 'Select a legal truck delivery',
                    icon: 'local_shipping',
                    disabled: !isATrucker,
                    tooltip: !isATrucker ? 'You are not a trucker' : ''
                },
                {
                    title: 'Illegal delivery (unavailable)',
                    subtitle: 'Select an illegal truck delivery',
                    icon: 'science',
                    disabled: !isATrucker, // TODO: Also disable if the player doesn't have trucker skill level 5
                    tooltip: !isATrucker ? 'You are not a trucker' : '' // TODO: Add possible error for skill level < 5
                },
                {
                    title: !isATrucker ? 'Get employed' : 'Already a trucker',
                    subtitle: !isATrucker ? 'Become a trucker' : 'You are already a trucker',
                    icon: 'badge',
                    unlocked: isATrucker
                }
            ] as UIButton[]
        }));
    }

    private finishDelivery(checkpoint: number): void {
        emitNet(`${GetCurrentResourceName()}:job-finished`);
        DeleteCheckpoint(checkpoint);
        DeleteEntity(GetVehicleTrailerVehicle(GetVehiclePedIsUsing(GetPlayerPed(-1)))[1]);
    }
}