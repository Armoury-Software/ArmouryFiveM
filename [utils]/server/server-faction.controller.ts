import { ServerController } from './server.controller';
import { FactionVehicle } from './models/faction-vehicle.interface';

import { Faction } from '../../factions/src/shared/models/faction.interface';

export class ServerFactionController extends ServerController {
    private _factionInternalId: string = '';
    protected get factionInternalId() {
        return this._factionInternalId;
    }

    private _spawnedVehicles: number[] = [];
    protected get spawnedVehicles() {
        return this._spawnedVehicles;
    }

    private _pendingVehicles: FactionVehicle[] = [];
    protected get pendingVehicles() {
        return this._pendingVehicles;
    }

    private vehicleSpawnTimeout: NodeJS.Timeout;

    public constructor() {
        super();

        this._assignDefaultListeners();
        this._factionInternalId = GetCurrentResourceName().split('-')[1];

        if (!GetCurrentResourceName().includes('factions-')) {
            console.error('You are using a Faction controller but its name does NOT comply with the naming \'factions-<factionInternalId>\'. The resource may not work properly.');
        }
    }

    protected registerVehicles(colors: number[], ...vehicles: FactionVehicle[]): void {
        const _vehicles: FactionVehicle[] = vehicles.map((factionVehicle: FactionVehicle) => ({ ...factionVehicle, color: colors }));

        this._pendingVehicles = _vehicles;
        if (global.exports['armoury'].getPlayers()?.length > 0) {
            this.spawnVehicles(_vehicles);

            console.log(`Players already online. Creating faction vehicles of faction '${this.factionInternalId}'.`);
        }
    }

    private _assignDefaultListeners(): void {
        onNet(`${GetCurrentResourceName()}:get-faction-information`, () => {
            const faction: Faction = global.exports['factions'].getFaction(this.factionInternalId);

            if (faction) {
                TriggerClientEvent(`${GetCurrentResourceName()}:get-faction-information-response`, source, faction);
            }
        });

        onNet('onResourceStop', (resourceName: string) => {
            if (resourceName === GetCurrentResourceName()) {
                this.clearVehicleSpawnTimeout();
                this.removeVehicles();
            }
        });

        onNet('authentication:player-authenticated', () => {
            if (!(this.spawnedVehicles?.length > 0)) {
                this.spawnVehicles(this._pendingVehicles);

                console.log(`A player has joined. Creating faction vehicles of faction '${this.factionInternalId}'.`);
            }
        });

        onNet('playerDropped', () => {
            if (!(global.exports['armoury'].getPlayers()?.length > 0)) {
                this.clearVehicleSpawnTimeout();
                this.removeVehicles();
                console.log(`No player left. Destroying faction vehicles of faction '${this.factionInternalId}'.`);
            }
        });
    }

    protected removeVehicle(vehicle: number, ignoreSplice?: boolean): void {
        if (DoesEntityExist(vehicle)) {
            DeleteEntity(vehicle);
        }

        if (this._spawnedVehicles.indexOf(vehicle) > -1) {
            if (!ignoreSplice) {
                this._spawnedVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
                this._pendingVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
            }
        }
    }

    protected removeVehicles(): void {
        this._spawnedVehicles.forEach((vehicle: number) => {
            this.removeVehicle(vehicle, true);
        });

        this._spawnedVehicles = [];
    }

    protected spawnVehicles(vehicles: FactionVehicle[]): void {
        this.vehicleSpawnTimeout = setTimeout(() => {
            vehicles.forEach((vehicle: FactionVehicle) => {
                const spawnedVehicle: number = CreateVehicle(vehicle.modelHash, vehicle.pos[0], vehicle.pos[1], vehicle.pos[2], 0.0, true, true);
                this._spawnedVehicles.push(spawnedVehicle);

                setTimeout(() => {
                    SetVehicleColours(spawnedVehicle, vehicle.color[0], vehicle.color[1]);
                    SetEntityRotation(spawnedVehicle, vehicle.pos[3], vehicle.pos[4], vehicle.pos[5], 2, true);
                }, 5000);
            });

            this.vehicleSpawnTimeout = null;
        }, 2000);
    }

    private clearVehicleSpawnTimeout(): void {
        if (this.vehicleSpawnTimeout) {
            clearTimeout(this.vehicleSpawnTimeout);
            this.vehicleSpawnTimeout = null;
        }
    }
}