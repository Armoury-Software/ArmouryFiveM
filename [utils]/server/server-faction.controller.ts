import { ServerController } from './server.controller';
import { FactionVehicle } from './models/faction-vehicle.interface';

export class ServerFactionController extends ServerController {
    private _spawnedVehicles: number[] = [];
    protected get spawnedVehicles() {
        return this._spawnedVehicles;
    }

    public constructor() {
        super();

        this._assignDefaultListeners();
    }

    protected registerVehicles(colors: number[], ...vehicles: FactionVehicle[]): void {
        setTimeout(() => {
            vehicles.forEach((vehicle: FactionVehicle) => {
                const spawnedVehicle: number = CreateVehicle(vehicle.modelHash, vehicle.pos[0], vehicle.pos[1], vehicle.pos[2], 0.0, true, true);
                SetVehicleColours(spawnedVehicle, colors[0], colors[1]);
                SetEntityRotation(spawnedVehicle, vehicle.pos[3], vehicle.pos[4], vehicle.pos[5], 2, true);
                this._spawnedVehicles.push(spawnedVehicle);
            });
        }, 2000);
    }

    private _assignDefaultListeners(): void {
        onNet('onResourceStop', (resourceName: string) => {
            if (resourceName === GetCurrentResourceName()) {
                this._spawnedVehicles.forEach((vehicle: number) => {
                    this.removeVehicle(vehicle);
                });

                this._spawnedVehicles = [];
            }
        });
    }

    protected removeVehicle(vehicle: number) {
        if (DoesEntityExist(vehicle)) {
            DeleteEntity(vehicle);
        }

        if (this._spawnedVehicles.indexOf(vehicle) > -1) {
            this._spawnedVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
        }
    }
}