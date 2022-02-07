import { Blip, BlipMonitored } from '../models/blip.model';
import { Marker, MarkerMonitored } from '../models/marker.model';
import { Delay, isPlayerInRangeOfPoint } from '../utils';
import { ClientBase } from './client.base';

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

    public constructor() {
        super();

        this.assignDefaultEntityListeners();
    }

    protected createBlips(blips: Blip[]): void {
        const _blips: BlipMonitored[] = blips.map((blip: Blip) => ({ ...blip, instance: null }));

        this._blips.push(..._blips);
        this.refreshBlips();
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
                blip.instance = AddBlipForCoord(blip.pos[0], blip.pos[1], blip.pos[2]);
                SetBlipSprite(blip.instance, blip.id);
                SetBlipDisplay(blip.instance, 4);
                SetBlipScale(blip.instance, 1.0);
                SetBlipColour(blip.instance, blip.color);
                SetBlipAsShortRange(blip.instance, true);
                BeginTextCommandSetBlipName('STRING');
                AddTextComponentString(blip.title);
                EndTextCommandSetBlipName(blip.instance);
            }
        });
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