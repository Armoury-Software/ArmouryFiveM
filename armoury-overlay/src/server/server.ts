import { OverlayItem } from "../shared/overlay-item.model";

const updateItem = (target: number, data: OverlayItem) => {
    TriggerClientEvent('armoury-overlay:update-item', target, data);
}

const showMoneyGainOverlay = (target: number, gain: number) => {
    TriggerClientEvent(`${GetCurrentResourceName()}:show-money-overlay`, target, gain);
}

exports('updateItem', updateItem);
exports('showMoneyGainOverlay', showMoneyGainOverlay);