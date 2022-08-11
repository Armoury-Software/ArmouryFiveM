import { ServerEntities } from "./server.entities";
import { EventListener, FiveMController } from "../decorators/armoury.decorators";

@FiveMController()
export class ServerController extends ServerEntities {
  private _clientsidedResourceMap: Map<number, { [metadataKey: string]: any }> = new Map<number, { [metadataKey: string]: any }>();
  protected get clientsidedResourceMap(): Map<number, { [metadataKey: string]: any }> {
    return this._clientsidedResourceMap;
  }

  protected getPlayerClientsidedCacheKey(playerId: number, key: string): any {
    if (this._clientsidedResourceMap.has(playerId)) {
      const metadataObject: { [metadataKey: string]: any } = this._clientsidedResourceMap.get(playerId);

      if (metadataObject[key]) {
        return metadataObject[key];
      }
    }

    return null;
  }

  protected updatePlayerClientsidedCacheKey(playerId: number, key: string, value: any): void {
    const currentPlayerClientsidedResourceMapValue = 
      this._clientsidedResourceMap.has(playerId)
        ? this._clientsidedResourceMap.get(playerId) || {}
        : {}
    ;

    currentPlayerClientsidedResourceMapValue[key] = value;

    this._clientsidedResourceMap.set(playerId, currentPlayerClientsidedResourceMapValue);
    TriggerClientEvent('armoury-overlay:update-resource-metadata', playerId, GetCurrentResourceName(), key, value);
  }

  @EventListener()
  public onPlayerClientsidedCacheLoaded(metadataObject: any): void {
    if (metadataObject[GetCurrentResourceName()]) {
      this._clientsidedResourceMap.set(source, metadataObject[GetCurrentResourceName()]);
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    if (this._clientsidedResourceMap.has(source)) {
      this._clientsidedResourceMap.delete(source);
    }
  }
}
