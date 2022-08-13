import { OverlayMessage } from '../shared/overlay-message.model';
import { OverlayItem } from '../shared/overlay-item.model';
import { ContextMenu } from '../shared/context-menu.model';

let messageRemovalTimer: NodeJS.Timer | null;

onNet('armoury-overlay:update-item', (data: OverlayItem) => {
  SendNuiMessage(
    JSON.stringify({
      type: 'update',
      stat: data.id,
      icon: data.icon,
      value: data.value?.toString(),
      redIgnored: data.redIgnored || false,
    })
  );
});

onNet('armoury-overlay:set-message', (data: OverlayMessage) => {
  SendNuiMessage(
    JSON.stringify({
      type: 'addmessage',
      message: JSON.stringify({
        id: data.id,
        content: data.content,
      }),
    })
  );

  if (data.removeAfter) {
    if (messageRemovalTimer != null) {
      clearTimeout(messageRemovalTimer);
    }

    messageRemovalTimer = setTimeout(() => {
      emit('armoury-overlay:delete-message', { id: data.id });

      if (messageRemovalTimer) {
        messageRemovalTimer = null;
      }
    }, data.removeAfter);
  }
});

onNet('armoury-overlay:delete-message', (data: OverlayMessage) => {
  SendNuiMessage(
    JSON.stringify({
      type: 'removemessage',
      message: JSON.stringify({
        id: data.id,
      }),
    })
  );
});

onNet(`${GetCurrentResourceName()}:show-money-overlay`, (gain: number) => {
  SendNuiMessage(
    JSON.stringify({
      type: 'moneygain',
      gain,
    })
  );
});

onNet(
  `${GetCurrentResourceName()}:play-background-music`,
  (url: string, volume: number = 1.0) => {
    SendNuiMessage(
      JSON.stringify({
        type: 'addbackgroundmusic',
        url,
        volume,
      })
    );
  }
);

onNet(`${GetCurrentResourceName()}:stop-background-music`, () => {
  SendNuiMessage(
    JSON.stringify({
      type: 'stopbackgroundmusic',
    })
  );
});

onNet(`${GetCurrentResourceName()}:show-context-menu`, (data: ContextMenu) => {
  SetNuiFocus(true, false);
  SetNuiFocusKeepInput(true);

  SendNuiMessage(
    JSON.stringify({
      type: 'showcontextmenu',
      menu: JSON.stringify(data),
    })
  );
});

onNet(`${GetCurrentResourceName()}:hide-context-menu`, () => {
  SetNuiFocus(false, false);
  SetNuiFocusKeepInput(false);

  SendNuiMessage(
    JSON.stringify({
      type: 'hidecontextmenu',
    })
  );
});

onNet(`${GetCurrentResourceName()}:set-taximeter-value`, (value: number) => {
  SendNuiMessage(
    JSON.stringify({
      type: 'updatetaximetervalue',
      taximeterValue: value,
    })
  );
});

onNet(
  `${GetCurrentResourceName()}:update-resource-metadata`,
  (resource: string, key: string, value: any) => {
    SendNuiMessage(
      JSON.stringify({
        type: 'addtoresourcecache',
        resource,
        cacheKey: key,
        cacheValue: value,
      })
    );
  }
);

RegisterNuiCallbackType('context-menu-item-pressed');
on(`__cfx_nui:context-menu-item-pressed`, (data: any, callback: Function) => {
  emit(`${GetCurrentResourceName()}:context-menu-item-pressed`, data);
  callback('ok');
});

RegisterNuiCallbackType('hide-context-menu');
on(`__cfx_nui:hide-context-menu`, (_data: any, callback: Function) => {
  emit(`${GetCurrentResourceName()}:hide-context-menu`);
  emit(`${GetCurrentResourceName()}:context-menu-hidden`);
  callback('ok');
});

// This callback should ONLY be called when armoury-overlay FIRST STARTS!!!!!!!!!!!
RegisterNuiCallbackType('resources-metadata-loaded');
on(`__cfx_nui:resources-metadata-loaded`, (_data: any, callback: Function) => {
  const computedData = JSON.parse(_data);
  if (computedData != null) {
    setTimeout(() => {
      TriggerServerEvent('armoury:player-resource-cache-loaded', computedData);
    }, 3000);
  }
  callback('ok');
});
