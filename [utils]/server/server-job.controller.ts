import { EventListener } from "@core/decorators/armoury.decorators";
import { ServerController } from "./server.controller";

export class ServerJobController extends ServerController {
    private _jobInternalId: string = '';
    protected get jobInternalId() {
        return this._jobInternalId;
    }

    private _spawnedVehicles: Map<number, JobVehicle> = new Map<number, JobVehicle>();
    protected get spawnedVehicles() {
        return this._spawnedVehicles;
    }

    public constructor() {
        super();

        this._assignDefaultListeners();
        this._jobInternalId = GetCurrentResourceName().split('-').slice(1).join();

        if (!GetCurrentResourceName().includes('job-')) {
            console.error('You are using a Faction controller but its name does NOT comply with the naming \'job-<jobInternalId>\'. The resource may not work properly.');
        }
    }

    private _assignDefaultListeners(): void {
        // onNet(`${GetCurrentResourceName()}:get-job-information`, () => {
        //     const faction: Faction = global.exports['factions'].getJob(this.factionInternalId);

        //     if (faction) {
        //         TriggerClientEvent(`${GetCurrentResourceName()}:get-faction-information-response`, source, faction);
        //     }
        // });

        onNet('onResourceStop', (resourceName: string) => {
            if (resourceName === GetCurrentResourceName()) {
                this.removeVehicles();
            }
        });

        onNet('playerDropped', () => {
            // if (!(global.exports['armoury'].getPlayers()?.length > 0)) {
            //     this.clearVehicleSpawnTimeout();
            //     this.removeVehicles();
            //     console.log(`No player left. Destroying faction vehicles of faction '${this.factionInternalId}'.`);
            // }
        });
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:map-vehicle` })
    public _mapVehicle(_spawnedVehicleNetworkId: number) {
      const _spawnedVehicleEntityId: number = NetworkGetEntityFromNetworkId(_spawnedVehicleNetworkId)
    }

    protected assignJob(target: number): void {
        global.exports['authentication'].setPlayerInfo(
        target,
        'job',
        this._jobInternalId,
        false
      );
      TriggerClientEvent(`${GetCurrentResourceName()}:job-assigned`, target);
    }

    protected removeVehicle(vehicle: number, ignoreSplice?: boolean): void {
        if (DoesEntityExist(vehicle)) {
            DeleteEntity(vehicle);
        }

        if (this._spawnedVehicles.indexOf(vehicle) > -1) {
            if (!ignoreSplice) {
                this._spawnedVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
            }
        }
    }

    protected removeVehicles(): void {
        this._spawnedVehicles.forEach((vehicle: number) => {
            this.removeVehicle(vehicle, true);
        });

        this._spawnedVehicles = [];
    }

    // protected spawnVehicle(vehicles: FactionVehicle[]): void {
    //     const spawnedVehicle: number = CreateVehicle(vehicle.modelHash, vehicle.pos[0], vehicle.pos[1], vehicle.pos[2], 0.0, true, true);
    //     this._spawnedVehicles.push(spawnedVehicle);
    // }

    // private clearVehicleSpawnTimeout(): void {
    //     if (this.vehicleSpawnTimeout) {
    //         clearTimeout(this.vehicleSpawnTimeout);
    //         this.vehicleSpawnTimeout = null;
    //     }
    // }
}