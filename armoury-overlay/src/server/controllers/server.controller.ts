import { Controller, Export, ServerController } from '@armoury/fivem-framework';
import { ContextMenu } from '@shared/context-menu.model';
import { OverlayItem } from '@shared/overlay-item.model';
import { OverlayMessage } from '@shared/overlay-message.model';

@Controller()
export class Server extends ServerController {
  @Export()
  public updateItem(target: number, data: OverlayItem) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:update-item`, target, data);
  }

  @Export()
  public setMessage(target: number, data: OverlayMessage) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:set-message`, target, data);
  }

  @Export()
  public deleteMessage(target: number, data: OverlayMessage) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:delete-message`, target, data);
  }

  @Export()
  public showMoneyGainOverlay(target: number, gain: number) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:show-money-overlay`, target, gain);
  }

  @Export()
  public playBackgroundMusic(target: number, url: string, volume: number = 1.0) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:play-background-music`, target, url, volume);
  }

  @Export()
  public stopBackgroundMusic(target: number) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:stop-background-music`, target);
  }

  @Export()
  public showContextMenu(target: number, data: ContextMenu) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:show-context-menu`, target, data);
  }

  @Export()
  public hideContextMenu(target: number) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:hide-context-menu`, target);
  }

  @Export()
  public setTaximeterValue(target: number, value: number) {
    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:set-taximeter-value`, target, value);
  }
}
