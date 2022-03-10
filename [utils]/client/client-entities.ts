import { COLOR_MAPPINGS } from './constants/color.mappings';
import { ClientBase } from './client.base';

import { Blip, BlipMonitored } from '../models/blip.model';
import { Marker, MarkerMonitored } from '../models/marker.model';
import { Delay, isPlayerInRangeOfPoint } from '../utils';

export class ClientEntities extends ClientBase {
    private _blips: BlipMonitored[] = [];
    protected get blips(): Blip[] {
        return this._blips;
    }

    private _markers: MarkerMonitored[] = [];
    protected get markers(): Marker[] {
        return this._markers;
    }

    private _vehicles: number[] = [];
    protected get vehicles(): number[] {
        return this._vehicles;
    }

    private _peds: number[] = [];
    protected get peds(): number[] {
        return this._peds;
    }

    private _waypoints: number[] = [];
    protected get waypoints(): number[] {
        return this._waypoints;
    }

    private _checkpoints: Map<number, number[]> = new Map();
    protected get checkpoints(): Map<number, number[]> {
        return this._checkpoints;
    }

    public constructor() {
        super();

        this.assignDefaultEntityListeners();
    }

    protected createBlips(blips: Blip[]): void {
        const _blips: BlipMonitored[] = blips.map((blip: Blip) => ({ ...blip, instance: null }));

        this._blips.push(..._blips);
        this.refreshBlips();
    }

    protected createBlip(blip: Blip): number {
        const _blip: number = AddBlipForCoord(blip.pos[0], blip.pos[1], blip.pos[2]);
        SetBlipSprite(_blip, blip.id);
        SetBlipDisplay(_blip, 4);
        SetBlipScale(_blip, 1.0);
        SetBlipColour(_blip, blip.color);
        SetBlipAsShortRange(_blip, true);
        BeginTextCommandSetBlipName('STRING');
        AddTextComponentString(blip.title);
        EndTextCommandSetBlipName(_blip);

        return _blip;
    }

    protected clearBlips(): void {
        this._blips.forEach((blip: BlipMonitored) => {
            RemoveBlip(blip.instance);
        });

        this._blips = [];
    }

    private refreshBlips(): void {
        this.blips.forEach((blip: BlipMonitored) => {
            if (!blip.instance) {
                blip.instance = this.createBlip(blip);
            }
        });
    }

    /** Defines a custom, irreplaceable waypoint */
    protected createWaypoint(pos: number[], title?: string, color?: number, id?: number, routeColor?: number): number {
        const currentResource: string = GetCurrentResourceName().replace('-', ' ');
        const defaultTitle: string = `${currentResource.slice(0, 1).toUpperCase()}${currentResource.slice(1)}`;

        const _waypoint: number = this.createBlip({
            id: id || 1,
            color: color || 69,
            title: title || defaultTitle,
            pos
        });
        this.createCheckpoint(2, pos[0], pos[1], pos[2], null, null, null, 3, COLOR_MAPPINGS[color][0], COLOR_MAPPINGS[color][1], COLOR_MAPPINGS[color][2], 255, 0);
        
        SetBlipRoute(_waypoint, true);
        if (routeColor) {
            SetBlipRouteColour(_waypoint, routeColor);
        }

        this._waypoints.push(_waypoint);

        return _waypoint;
    }

    protected clearWaypoints(): void {
        this._waypoints.forEach((waypoint: number) => {
            this.clearWaypoint(waypoint, true);
        });

        this._waypoints = [];
    }

    protected clearWaypoint(waypoint: number, ignoreSplice: boolean = false): void {
        this.clearCheckpointByPosition(GetBlipCoords(waypoint));

        SetBlipRoute(waypoint, false);
        RemoveBlip(waypoint);

        if (!ignoreSplice) {
            this._waypoints.splice(this._waypoints.indexOf(waypoint), 1);
        }
    }

    protected createCheckpoint(
        type: number,
        posX1: number,
        posY1: number,
        posZ1: number,
        posX2: number,
        posY2: number,
        posZ2: number,
        diameter: number, 
		red: number, 
		green: number, 
		blue: number, 
		alpha: number, 
		reserved: number
    ): number {
        const checkpoint = CreateCheckpoint(type, posX1, posY1, posZ1, posX2, posY2, posZ2, diameter, red, green, blue, alpha, reserved);
        this._checkpoints.set(checkpoint, [posX1, posY1, posZ1, posX2, posY2, posZ2]);

        return checkpoint;
    }

    protected clearCheckpoint(checkpoint: number): void {
        DeleteCheckpoint(checkpoint);
        if (this._checkpoints.has(checkpoint)) {
            this._checkpoints.delete(checkpoint);
        }
    }

    protected clearCheckpointByPosition(pos: number[]): void {
        const checkpoint: number = Array.from(this._checkpoints.keys()).find(
            (_checkpoint: number) =>
                this._checkpoints.get(_checkpoint)[0] === pos[0]
                && this._checkpoints.get(_checkpoint)[1] === pos[1]
                && this._checkpoints.get(_checkpoint)[2] === pos[2]
        );

        if (checkpoint) {
            this.clearCheckpoint(checkpoint);
        }
    }

    /** Defines permanent markers. Handles draw-per-tick automatically. */
    protected createMarkers(markers: Marker[]): void {
        const _markers: MarkerMonitored[] = markers.map((marker: Marker) => ({ ...marker, instance: null }));
        this._markers.push(..._markers);
        this.refreshMarkers();
    }

    protected clearMarkers(): void {
        this._markers = [];
        this.removeFromTick(`${GetCurrentResourceName()}_markers`);
    }

    private refreshMarkers(): void {
        this.addToTickUnique({
            id: `${GetCurrentResourceName()}_markers`,
            function: async () => {
                const position: number[] = GetEntityCoords(GetPlayerPed(-1), true);

                this._markers.forEach(async (marker: MarkerMonitored) => {
                    if (isPlayerInRangeOfPoint(position[0], position[1], position[2], marker.pos[0], marker.pos[1], marker.pos[2], marker.renderDistance)) {
                        if (marker.textureDict && !HasStreamedTextureDictLoaded(marker.textureDict)) {
                            RequestStreamedTextureDict(marker.textureDict, true);
                            
                            while (!HasStreamedTextureDictLoaded(marker.textureDict)) {
                                await Delay(100);
                            }
                        }
                        
                        DrawMarker(marker.marker, marker.pos[0], marker.pos[1], marker.pos[2], 0.0, 0.0, 0.0, marker.rotation?.[0] || 0.0, marker.rotation?.[1] || 0.0, marker.rotation?.[2] || 0.0, marker.scale, marker.scale, marker.scale, marker.rgba[0], marker.rgba[1], marker.rgba[2], marker.rgba[3], false, true, 2, false, marker.textureDict || null, marker.textureName || null, false);
                        
                        if (marker.underlyingCircle) {
                            DrawMarker(marker.underlyingCircle.marker, marker.pos[0], marker.pos[1], marker.pos[2] - 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, marker.underlyingCircle.scale, marker.underlyingCircle.scale, marker.underlyingCircle.scale, marker.underlyingCircle.rgba[0] || marker.rgba[0], marker.underlyingCircle.rgba[1] || marker.rgba[1], marker.underlyingCircle.rgba[2] || marker.rgba[2], marker.underlyingCircle.rgba[3] || marker.rgba[3], false, true, 2, false, null, null, false);
                        }
                    }
                });
            }
        });
    }

    /** Wrapper of FiveM's native CreateVehicle - includes requesting the model */
    protected async createVehicleAsync(modelHash: string | number, x: number, y: number, z: number, heading: number, isNetwork: boolean, netMissionEntity: boolean, putPlayerInVehicle: boolean = false): Promise<number> {
        let attempts: number = 0;

        RequestModel(modelHash);
        while (!HasModelLoaded(modelHash)) {
            if (attempts > 10) {
                return 0;
            }

            await Delay(100);
            attempts ++;
        }
        
        const createdVehicle: number = CreateVehicle(modelHash, x, y, z, heading, isNetwork, netMissionEntity);
        if (createdVehicle) {
            if (netMissionEntity) {
                this._vehicles.push(createdVehicle);
            }

            if (putPlayerInVehicle) {
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), createdVehicle, -1);
            }
        }
        return createdVehicle;
    }

    protected removeVehicle(vehicle: number) {
        if (DoesEntityExist(vehicle)) {
            DeleteEntity(vehicle);
        }

        if (this._vehicles.indexOf(vehicle) > -1) {
            this._vehicles.splice(this._vehicles.indexOf(vehicle), 1);
        }
    }

    protected removePed(ped: number) {
        if (DoesEntityExist(ped)) {
            DeleteEntity(ped);
        }

        if (this._peds.indexOf(ped) > -1) {
            this._peds.splice(this._peds.indexOf(ped), 1);
        }
    }

    protected async createPedInsideVehicleAsync(vehicle: number, pedType: number, modelHash: number | string, seat: number, isNetwork: boolean, bScriptHostPed: boolean): Promise<number> {
        let attempts: number = 0;

        RequestModel(modelHash);
        while (!HasModelLoaded(modelHash)) {
            if (attempts > 10) {
                return 0;
            }

            await Delay(100);
            attempts ++;
        }
        
        const createdPed: number = CreatePedInsideVehicle(vehicle, pedType, modelHash, seat, isNetwork, bScriptHostPed);
        if (createdPed) {
            this._peds.push(createdPed);
        }
        return createdPed;
    }

    private assignDefaultEntityListeners(): void {
        onNet('onResourceStop', (resourceName: string) => {
            if (resourceName === GetCurrentResourceName()) {
                this._vehicles.forEach((vehicle: number) => {
                    this.removeVehicle(vehicle);
                });

                this._peds.forEach((ped: number) => {
                    this.removePed(ped);
                });

                this._vehicles = [];
                this._peds = [];
            }
        });
    }
}