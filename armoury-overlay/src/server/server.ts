import { OverlayMessage } from '../shared/overlay-message.model';
import { OverlayItem } from '../shared/overlay-item.model';
import { ContextMenu } from '../shared/context-menu.model';

const updateItem = (target: number, data: OverlayItem) => {
  TriggerClientEvent('armoury-overlay:update-item', target, data);
};

const setMessage = (target: number, data: OverlayMessage) => {
  TriggerClientEvent('armoury-overlay:set-message', target, data);
};

const deleteMessage = (target: number, data: OverlayMessage) => {
  TriggerClientEvent('armoury-overlay:delete-message', target, data);
};

const showMoneyGainOverlay = (target: number, gain: number) => {
  TriggerClientEvent(
    `${GetCurrentResourceName()}:show-money-overlay`,
    target,
    gain
  );
};

const playBackgroundMusic = (
  target: number,
  url: string,
  volume: number = 1.0
) => {
  TriggerClientEvent(
    `${GetCurrentResourceName()}:play-background-music`,
    target,
    url,
    volume
  );
};

const stopBackgroundMusic = (target: number) => {
  TriggerClientEvent(
    `${GetCurrentResourceName()}:stop-background-music`,
    target
  );
};

const showContextMenu = (target: number, data: ContextMenu) => {
  TriggerClientEvent(
    `${GetCurrentResourceName()}:show-context-menu`,
    target,
    data
  );
};

const hideContextMenu = (target: number) => {
  TriggerClientEvent(`${GetCurrentResourceName()}:hide-context-menu`, target);
};

const setTaximeterValue = (target: number, value: number) => {
  TriggerClientEvent(
    `${GetCurrentResourceName()}:set-taximeter-value`,
    target,
    value
  );
};

exports('updateItem', updateItem);
exports('showMoneyGainOverlay', showMoneyGainOverlay);
exports('playBackgroundMusic', playBackgroundMusic);
exports('stopBackgroundMusic', stopBackgroundMusic);
exports('setMessage', setMessage);
exports('deleteMessage', deleteMessage);
exports('showContextMenu', showContextMenu);
exports('hideContextMenu', hideContextMenu);
exports('setTaximeterValue', setTaximeterValue);
