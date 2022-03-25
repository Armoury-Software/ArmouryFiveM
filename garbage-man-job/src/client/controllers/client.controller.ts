import { ClientWithUIController } from '@core/client/client-ui.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';
import { UIButton } from '@core/models/ui-button.model';
import { waitUntilThenDo } from '@core/utils';

var cpNumb=0;
@FiveMController()
export class Client extends ClientWithUIController {
    public constructor(){
        super();
        this.createBlips([
            {
                id: 318,
                color: 69,
                title: 'Garbage-Man Job',
                pos:[-263.5516357421875,201.8109893798828,84.934814453125]
            }
        ]);
        this.createMarkers([
            {
                marker: 3,
                pos:[-263.5516357421875, 201.8109893798828, 84.934814453125],
                scale: 1.0,
                rgba:[21, 177, 33, 255],
                renderDistance: 35.0,
                underlyingCircle:{
                    marker:25,
                    scale: 1.75,
                    rgba: [136, 255, 145, 255]
                }
            }
        ]);
        this.createActionPoints(
            {
                
                pos: [-263.5516357421875, 201.8109893798828, 84.934814453125],
                action: () => {
                    if (!this.isUIShowing() && !this.isUIOnCooldown() && !IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
                        this.showGarbageManMenu();
                    }
                }
            });

            this.addControllerListeners();
            this.addUIListener('buttonclick');
    }
    
    private showGarbageManMenu(): void {
        this.updateUIData();
        this.showUI();
    }

    private updateUIData(): void {
        const isAGarbageMan: boolean = this.getPlayerInfo('job') === 'garbageman';
        SendNuiMessage(JSON.stringify({
            type: 'update',
            title: 'Garbage Man Job',
            description: 'Los Santos Cleaning Services keeps the Los Santos City clean.',
            resource: 'garbage-man-job',
            buttons: [
                {
                    title: 'Start Job',
                    subtitle: 'Get a garbage car and go clean the city!',
                    icon: 'play_arrow',
                    disabled: !isAGarbageMan,
                    tooltip: !isAGarbageMan ? 'You are not a garbage man' : ''
                },
                {
                    title: !isAGarbageMan ? 'Get employed' : 'Already a garbage man',
                    subtitle: !isAGarbageMan ? 'Become a garbage man' : 'You are already a garbage man',
                    icon: 'badge',
                    unlocked: isAGarbageMan
                }
            ] as UIButton[]
        }));
    }
    protected onIncomingUIMessage(eventName: string, eventData: any): void {
        super.onIncomingUIMessage(eventName, eventData);

        if (eventName === 'buttonclick') {
            const data: { buttonId: number } = eventData;

            switch (data.buttonId) {
                case 0: {
                    TriggerServerEvent(`${GetCurrentResourceName()}:start-job`, IsPedInAnyVehicle(GetPlayerPed(-1), false));
                    this.hideUI();
                    break;
                }
                case 1: {
                    TriggerServerEvent(`${GetCurrentResourceName()}:get-job`);
                    break;
                }
            }
        }
    }
        
    private addControllerListeners(): void {
        onNet(`${GetCurrentResourceName()}:begin-job`, async(targetCheckpoint:{X: number, Y: number, Z: number}) => {
            const Checkpoint = CreateCheckpoint(2, targetCheckpoint.X, targetCheckpoint.Y, targetCheckpoint.Z, null, null, null, 3, 50, 133, 63, 255, 0);
            ClearGpsPlayerWaypoint();
            SetNewWaypoint(targetCheckpoint.X, targetCheckpoint.Y);
            let _spawnedVeh : number;
            if (!IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
                _spawnedVeh = await this.createVehicleAsync(GetHashKey('Trash'), -267.5868225097656,197.41978454589844,85.22119140625+5, -85, true, true);
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), _spawnedVeh, -1);
            } else {
                _spawnedVeh = GetVehiclePedIsIn(GetPlayerPed(-1), false);
            }
            
            this.createActionPoints(
                {
                    pos:[targetCheckpoint.X, targetCheckpoint.Y, targetCheckpoint.Z],
                    action: () => {
                        this.onReachCP(Checkpoint);
                    },
                    once: true
                }
            );
        });
        onNet(`${GetCurrentResourceName()}:job-assigned`, () => {
            waitUntilThenDo(
                () => this.getPlayerInfo('job') === 'garbageman',
                () => { this.updateUIData(); }
            );
        });
    }
    private onReachCP(Checkpoint: number): void {
        emitNet(`${GetCurrentResourceName()}:cp-reached`);
        DeleteCheckpoint(Checkpoint);
    }
    public onForceShowUI(): void {
        this.showGarbageManMenu();
    }

    public onForceHideUI(): void {
        super.onForceHideUI();
    }
}