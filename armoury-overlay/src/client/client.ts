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

RegisterNuiCallbackType('context-menu-item-pressed');
on(`__cfx_nui:context-menu-item-pressed`, (data: any, callback: Function) => {
  console.log(data);
  emit(`${GetCurrentResourceName()}:context-menu-item-pressed`, data);
  callback('ok');
});

RegisterNuiCallbackType('hide-context-menu');
on(`__cfx_nui:hide-context-menu`, (_data: any, callback: Function) => {
  emit(`${GetCurrentResourceName()}:hide-context-menu`);
  emit(`${GetCurrentResourceName()}:context-menu-hidden`);
  callback('ok');
});
