import { EventListener, FiveMController } from "@core/decorators/armoury.decorators";
import { ServerController } from "./server.controller";
import { JobVehicleInfo } from "./models/job-vehicle.interface"

@FiveMController()
export class ServerJobController extends ServerController {
    private _jobInternalId: string = '';
    protected get jobInternalId() {
        return this._jobInternalId;
    }

    private playersAssignedToVehicles: Map<number, JobVehicleInfo> = new Map<number, JobVehicleInfo>();
    protected get spawnedVehicles() {
        return this.playersAssignedToVehicles;
    }

    public constructor() {
        super();
        
        this._jobInternalId = GetCurrentResourceName().split('-').slice(1).join('-');

        if (!GetCurrentResourceName().includes('job-')) {
            console.error('You are using a Faction controller but its name does NOT comply with the naming \'job-<jobInternalId>\'. The resource may not work properly.');
        }
    }

    @EventListener()
    public onResourceStop(resourceName: string) {
        if (resourceName === GetCurrentResourceName()) {
            this.removeVehicles();
        }
    }

    @EventListener()
    public onPlayerDisconnect() {
        this.destroyPlayerVehicle(source);
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:add-job-vehicle-to-map` })
    public onMapVehicle(target: number, _spawnedVehicleNetworkId: number) {
      const _spawnedVehicleEntityId: number = NetworkGetEntityFromNetworkId(_spawnedVehicleNetworkId)
      if (this.playersAssignedToVehicles.has(target)) {
          this.destroyPlayerVehicle(target);
      }
      this.playersAssignedToVehicles.set(target, {vehicleEntityId: _spawnedVehicleEntityId, metadata: {}});
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:update-job-vehicle-in-map` })
    public onUpdateVehicles(target: number, _metadata: {
        [metadataId: string]: any
    }) {
        Array.from(Object.keys(_metadata)).forEach((key: string) => {
            _metadata[key] = NetworkGetEntityFromNetworkId(_metadata[key]);
        })
        this.spawnedVehicles.set(target, { ...this.spawnedVehicles.get(target), metadata: _metadata }); 
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:destroy-job-vehicle-from-map` })
    public onDestroyVehicle(target: number) {
        this.destroyPlayerVehicle(target);
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:cancel-job` })
    public onJobCancel(target: number) {
        this.destroyPlayerVehicle(target);
        TriggerClientEvent(
            `${GetCurrentResourceName()}:cancel-waypoint-and-action`,
            target
        )
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

    protected removeVehicle(vehicle: number): void {
        if (DoesEntityExist(vehicle)) {
            DeleteEntity(vehicle);
        }
    }

    protected removeVehicles(): void {
        Array.from(this.playersAssignedToVehicles.keys()).forEach((playerId: number) => {
            this.removeVehicle(playerId);
        })
    }

    private destroyPlayerVehicle(target: number): void {
        const spawnedVehicle = this.playersAssignedToVehicles.get(target).vehicleEntityId;
        this.removeVehicle(spawnedVehicle);
        if (this.playersAssignedToVehicles.get(target).metadata) {
            Array.from(Object.keys(this.playersAssignedToVehicles.get(target).metadata)).forEach((_metadata: string) => {
                this.removeVehicle(this.playersAssignedToVehicles.get(target).metadata[_metadata]);
            })
        }
        this.playersAssignedToVehicles.delete(target);
    }
}