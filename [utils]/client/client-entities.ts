import { EventListener, FiveMController } from '../decorators/armoury.decorators';
import { COLOR_MAPPINGS } from './constants/color.mappings';
import { ClientBase } from './client.base';

import { Blip, BlipMonitored } from '../models/blip.model';
import { Marker, MarkerMonitored } from '../models/marker.model';
import { Delay, isPlayerInRangeOfPoint } from '../utils';

@FiveMController()
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
    const _blip: number = (
      !blip.type || blip.type === 'coords'
        ? AddBlipForCoord(blip.pos[0], blip.pos[1], blip.pos[2])
        : (
          blip.type === 'range'
            ? AddBlipForRadius(blip.pos[0], blip.pos[1], blip.pos[2], blip.scale || 1.0)
            : AddBlipForEntity(blip.entityId ?? PlayerPedId())
        )
    );
    if (!blip.type || blip.type !== 'range') {
      SetBlipScale(_blip, blip.scale || 1.0);
    }
    SetBlipSprite(_blip, blip.id);
    SetBlipDisplay(_blip, 4);
    SetBlipColour(_blip, blip.color);
    SetBlipAlpha(_blip, blip.alpha || 255);
    SetBlipAsShortRange(_blip, !blip.longRange);
    BeginTextCommandSetBlipName('STRING');
    AddTextComponentString(blip.title);
    EndTextCommandSetBlipName(_blip);

    return _blip;
  }

  protected clearBlip(blipId: number): void {
    this._blips = this._blips.filter((_blip) => _blip.instance !== blipId);

    if (DoesBlipExist(blipId)) {
      RemoveBlip(blipId);
    }
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
  protected createWaypoint(pos: number[], title?: string, color?: number, id?: number, routeColor?: number, diameter: number = 3.0): number {
    const currentResource: string = GetCurrentResourceName().replace('-', ' ');
    const defaultTitle: string = `${currentResource.slice(0, 1).toUpperCase()}${currentResource.slice(1)}`;

    const _waypoint: number = this.createBlip({
      id: id || 1,
      color: color || 69,
      title: title || defaultTitle,
      pos,
      longRange: true
    });
    this.createCheckpoint(2, pos[0], pos[1], pos[2], null, null, null, diameter, COLOR_MAPPINGS[color][0], COLOR_MAPPINGS[color][1], COLOR_MAPPINGS[color][2], 255, 0);
    
    if (routeColor !== -1) {
      SetBlipRoute(_waypoint, true);
      if (routeColor) {
        SetBlipRouteColour(_waypoint, routeColor);
      }
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
        Math.floor(this._checkpoints.get(_checkpoint)[0]) === Math.floor(pos[0])
        && Math.floor(this._checkpoints.get(_checkpoint)[1]) === Math.floor(pos[1])
        && Math.floor(this._checkpoints.get(_checkpoint)[2]) === Math.floor(pos[2])
    );

    if (checkpoint) {
      this.clearCheckpoint(checkpoint);
    }
  }

  /** Defines permanent markers. Handles draw-per-tick automatically. */
  protected createMarkers(markers: Marker[]): void {
    const _markers: MarkerMonitored[] = markers.map((marker: Marker) => ({ ...marker, instance: null }));
    this._markers.push(..._markers);
  }

  protected clearMarkers(): void {
    this._markers = [];
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

  protected async createPedAsync(pedType: number, modelHash: number, x: number, y: number, z: number, heading: number, isNetwork: boolean, bScriptHostPed: boolean): Promise<number> {
    let attempts: number = 0;

    RequestModel(modelHash);
    while (!HasModelLoaded(modelHash)) {
        if (attempts > 10) {
            return 0;
        }

        await Delay(100);
        attempts ++;
    }
    
    const createdPed: number = CreatePed(pedType, modelHash, x, y, z, heading, isNetwork, bScriptHostPed);
    if (createdPed) {
        this._peds.push(createdPed);
    }
    return createdPed;
  }

  protected async playAnimForPed(ped: number, animationDict: string, animationName: string, duration: number, flag: number = 0, blendInSpeed: number = 8.0, blendOutSpeed: number = 8.0): Promise<void> {
    let attempts: number = 0;
    
    RequestAnimDict(animationDict);
    while (!HasAnimDictLoaded(animationDict)) {
      if (attempts > 10) {
          return;
      }

      await Delay(100);
      attempts ++;
    }

    if (HasAnimDictLoaded(animationDict)) {
      TaskPlayAnim(
        ped,
        animationDict,
        animationName,
        blendInSpeed,
        blendOutSpeed,
        duration,
        flag,
        0,
        false,
        false,
        false
      );
    }
  }

  protected async setPedModelAsync(ped: number, modelHash: number): Promise<boolean> {
    let attempts: number = 0;

    RequestModel(modelHash);
    while (!HasModelLoaded(modelHash)) {
        if (attempts > 10) {
            return false;
        }

        await Delay(100);
        attempts ++;
    }
    
    SetPlayerModel(ped, modelHash);
    SetModelAsNoLongerNeeded(modelHash);
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

  @EventListener({ eventName: `${GetCurrentResourceName()}:refresh-virtual-world` })
  protected onRefreshPlayersInVirtualWorld(): void {
    const activePlayers: number[] = GetActivePlayers();

    activePlayers.forEach((activePlayer: number) => {
      const playerServerId: number = GetPlayerServerId(activePlayer);
      if (this.getPlayerInfo('virtualWorld') === this.getPlayerInfo('virtualWorld', playerServerId)) {
        NetworkConcealPlayer(activePlayer, false, false);
      } else {
        NetworkConcealPlayer(activePlayer, true, false);
      }
    });
  }
}