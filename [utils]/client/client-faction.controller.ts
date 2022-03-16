import { Faction } from '../../factions/src/shared/models/faction.interface';
import { Blip, BlipMonitored } from '../models/blip.model';

import { ClientWithUIController } from './client-ui.controller';

export abstract class ClientFactionController extends ClientWithUIController {
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