import { OverlayItem } from "../shared/overlay-item.model";

onNet('armoury-overlay:update-item', (data: OverlayItem) => {
    SendNuiMessage(JSON.stringify({
        type: 'update',
        stat: data.id,
        icon: data.icon,
        value: data.value.toString()
    }));
});

onNet(`${GetCurrentResourceName()}:show-money-overlay`, (gain: number) => {
    SendNuiMessage(JSON.stringify({
        type: 'moneygain',
        gain
    }));
});
