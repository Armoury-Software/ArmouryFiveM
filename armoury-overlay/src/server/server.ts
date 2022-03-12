import { OverlayMessage } from "../shared/overlay-message.model";
import { OverlayItem } from "../shared/overlay-item.model";

const updateItem = (target: number, data: OverlayItem) => {
    TriggerClientEvent('armoury-overlay:update-item', target, data);
}

const setMessage = (target: number, data: OverlayMessage) => {
    TriggerClientEvent('armoury-overlay:set-message', target, data);
}

const deleteMessage = (target: number, data: OverlayMessage) => {
    TriggerClientEvent('armoury-overlay:delete-message', target, data);
}

const showMoneyGainOverlay = (target: number, gain: number) => {
    TriggerClientEvent(`${GetCurrentResourceName()}:show-money-overlay`, target, gain);
}

exports('updateItem', updateItem);
exports('showMoneyGainOverlay', showMoneyGainOverlay);
exports('setMessage', setMessage);
exports('deleteMessage', deleteMessage);