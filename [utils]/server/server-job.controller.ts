import { EventListener } from "@core/decorators/armoury.decorators";
import { ServerController } from "./server.controller";
import { JobVehicleInfo } from "./models/job-vehicle.interface"

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
        
        this._jobInternalId = GetCurrentResourceName().split('-').slice(1).join();

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
    public onMapVehicle(_spawnedVehicleNetworkId: number, source: number, _metadata?: any) {
      const _spawnedVehicleEntityId: number = NetworkGetEntityFromNetworkId(_spawnedVehicleNetworkId)
      this.playersAssignedToVehicles.set(source, {vehicleEntityId: _spawnedVehicleEntityId, metadata: _metadata? _metadata : {}});
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:update-job-vehicle-in-map` })
    public onUpdateVehicles(source: number, _metadata: any) {
        this.spawnedVehicles.set(source, {..._metadata? _metadata : {}});
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:destroy-job-vehicle-from-map` })
    public onDestroyVehicle(_source: number) {
        this.destroyPlayerVehicle(source);
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

    private destroyPlayerVehicle(source: number): void {
        const spawnedVehicle = this.playersAssignedToVehicles.get(source).vehicleEntityId;
        this.removeVehicle(spawnedVehicle);
        if (this.playersAssignedToVehicles.get(source).metadata) {
            this.playersAssignedToVehicles.get(source).metadata.forEach((_metadata: string) => {
                this.removeVehicle(this.playersAssignedToVehicles.get(source).metadata[_metadata]);
            })
        }
        this.playersAssignedToVehicles.delete(source);
    }
}