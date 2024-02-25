import { Controller, EVENT_DIRECTIONS, EventListener } from '@armoury/fivem-framework';
import { ContextMenu } from '@shared/context-menu.model';
import { OverlayItem } from '@shared/overlay-item.model';
import { OverlayMessage } from '@shared/overlay-message.model';

@Controller()
export class Client {
  private messageRemovalTimer: NodeJS.Timeout | null;

  // TODO: Create @armoury/fivem-framework decorator for RegisterNuiCallbackType
  public constructor() {
    Cfx.Client.RegisterNuiCallbackType('context-menu-item-pressed');
    Cfx.Client.RegisterNuiCallbackType('hide-context-menu');
    Cfx.Client.RegisterNuiCallbackType('resources-metadata-loaded');
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:update-item` })
  public onItemUpdate(data: OverlayItem) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'update',
        stat: data.id,
        icon: data.icon,
        value: data.value?.toString(),
        redIgnored: data.redIgnored || false,
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:set-message` })
  public onSetMessage(data: OverlayMessage) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'addmessage',
        message: JSON.stringify({
          id: data.id,
          content: data.content,
        }),
      })
    );

    if (data.removeAfter) {
      if (this.messageRemovalTimer != null) {
        clearTimeout(this.messageRemovalTimer);
      }

      this.messageRemovalTimer = setTimeout(() => {
        Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:delete-message`, { id: data.id });

        if (this.messageRemovalTimer) {
          this.messageRemovalTimer = null;
        }
      }, data.removeAfter);
    }
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:delete-message` })
  public onDeleteMessage(data: OverlayMessage) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'removemessage',
        message: JSON.stringify({
          id: data.id,
        }),
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:show-money-overlay` })
  public onShowMoneyOverlay(gain: number) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'moneygain',
        gain,
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:play-background-music` })
  public onPlayBackgroundMusic(url: string, volume: number = 1.0) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'addbackgroundmusic',
        url,
        volume,
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:stop-background-music` })
  public onStopBackgroundMusic() {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'stopbackgroundmusic',
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:show-context-menu` })
  public onShowContextMenu(data: ContextMenu) {
    Cfx.Client.SetNuiFocus(true, false);
    Cfx.Client.SetNuiFocusKeepInput(true);

    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'showcontextmenu',
        menu: JSON.stringify(data),
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:hide-context-menu` })
  public onHideContextMenu() {
    Cfx.Client.SetNuiFocus(false, false);
    Cfx.Client.SetNuiFocusKeepInput(false);

    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'hidecontextmenu',
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:set-taximeter-value` })
  public onSetTaximeterValue(value: number) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'updatetaximetervalue',
        taximeterValue: value,
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:update-resource-metadata` })
  public onUpdateResourceMetadata(resource: string, key: string, value: any) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'addtoresourcecache',
        resource,
        cacheKey: key,
        cacheValue: value,
      })
    );
  }

  @EventListener({ eventName: '__cfx_nui:context-menu-item-pressed', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onNuiContextMenuItemPressed(data: any, callback: Function) {
    Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:context-menu-item-pressed`, data);
    callback('ok');
  }

  @EventListener({ eventName: '__cfx_nui:hide-context-menu', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onNuiHideContextMenu(_data: any, callback: Function) {
    Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:hide-context-menu`);
    Cfx.emit(`${Cfx.Client.GetCurrentResourceName()}:context-menu-hidden`);
    callback('ok');
  }

  // This callback should ONLY be called when armoury-overlay FIRST STARTS!!!!!!!!!!!
  @EventListener({ eventName: '__cfx_nui:resources-metadata-loaded', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onNuiResourcesMetadataLoaded(data: any, callback: Function) {
    const computedData = JSON.parse(data);
    if (computedData != null) {
      setTimeout(() => {
        Cfx.TriggerServerEvent('armoury:player-resource-cache-loaded', computedData);
      }, 3000);
    }
    callback('ok');
  }
}
