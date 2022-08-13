import { EventListener, FiveMController } from '@core/decorators/armoury.decorators';
import { ActionPoint } from '@core/models/action-point.model';
import { Faction } from '../../factions/src/shared/models/faction.interface';
import { Blip, BlipMonitored } from '../models/blip.model';

import { ClientWithUIController } from './client-ui.controller';

@FiveMController()
export class ClientFactionController extends ClientWithUIController {
    private _factionInternalId: string = '';
    protected get factionInternalId() {
        return this._factionInternalId;
    }

    private factionIndividualBlip: Blip | number;

    public constructor() {
      super();

      this._factionInternalId = GetCurrentResourceName().split('-')[1];
      this.__assignDefaultListeners();
    }

    protected setupFactionIndividualBlip(blip: Blip): void {
      setTimeout(() => {
        this.factionIndividualBlip = blip;
        this.triggerSingleEntityRetrieval();
      }, 2000);
    }

    protected onSingleEntityResponse(faction: Faction): void {
      if (this.factionIndividualBlip != null && typeof(this.factionIndividualBlip) !== 'number' && this.factionIndividualBlip.hasOwnProperty('id')) {
        const factionTitle: string = this.factionIndividualBlip.title;  
        
        this.createBlips([
          {
            id: this.factionIndividualBlip.id,
            color: this.factionIndividualBlip.color,
            title: factionTitle,
            pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
          },
        ]);

        this.factionIndividualBlip = (<BlipMonitored>(
          this.blips.find(
              (blip: BlipMonitored) => blip.title === factionTitle
          )
        ))?.instance;
      }
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:add-vehicle-locker-action-points` })
    public onShouldAddVehicleLockerActionPoints(actionPointsPositions: number[][]): void {
      this.createActionPoints(
        ...actionPointsPositions.map((position: number[], index: number) => ({
          pos: position,
          action: () => {
            DisableControlAction(0, 38, true);
            DisableControlAction(0, 68, true);
            DisableControlAction(0, 86, true);
            DisableControlAction(0, 29, true);

            BeginTextCommandDisplayHelp('STRING');
            AddTextComponentSubstringPlayerName(this.translate('tooltip_open_key_locker'));
            EndTextCommandDisplayHelp(0, false, true, 1);

            if (IsDisabledControlJustPressed(0, 38)) {
              ExecuteCommand(`openkeylocker ${index}`);
            }
          }
        }))
      );

      this.createMarkers([...actionPointsPositions.map((position: number[]) => ({
        marker: 36,
        pos: position,
        scale: 0.75,
        rgba: [255, 255, 255, 255],
        renderDistance: 10.0,
        underlyingCircle: {
          marker: 25,
          scale: 1.3,
          rgba: [255, 255, 255, 255]
        }
      }))]);
    }

    @EventListener({ eventName: `${GetCurrentResourceName()}:add-clothing-locker-action-points` })
    public onShouldAddClothingLockerActionPoints(actionPointsPositions: number[][]): void {
      this.createActionPoints(
        ...actionPointsPositions.map((position: number[], index: number) => ({
          pos: position,
          action: () => {
            DisableControlAction(0, 38, true);
            DisableControlAction(0, 68, true);
            DisableControlAction(0, 86, true);
            DisableControlAction(0, 29, true);

            BeginTextCommandDisplayHelp('STRING');
            AddTextComponentSubstringPlayerName(this.translate('tooltip_open_clothing_locker'));
            EndTextCommandDisplayHelp(0, false, true, 1);

            if (IsDisabledControlJustPressed(0, 38)) {
              ExecuteCommand(`openclothinglocker ${index}`);
            }
          }
        }))
      );

      this.createMarkers([...actionPointsPositions.map((position: number[]) => ({
        marker: 20,
        pos: position,
        scale: 0.75,
        rgba: [255, 255, 255, 255],
        renderDistance: 10.0,
        underlyingCircle: {
          marker: 25,
          scale: 1.3,
          rgba: [255, 255, 255, 255]
        }
      }))]);
    }

    /** Makes onSingleEntityResponse trigger immediately */
    protected triggerSingleEntityRetrieval(): void {
      TriggerServerEvent(`${GetCurrentResourceName()}:get-faction-information`, this.factionInternalId);
    }

    private __assignDefaultListeners(): void {
      onNet(`${GetCurrentResourceName()}:get-faction-information-response`, (faction: Faction) => {
          this.onSingleEntityResponse(faction);
      });
    }
}