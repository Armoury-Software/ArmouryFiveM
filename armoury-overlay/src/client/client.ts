import { OverlayMessage } from "../shared/overlay-message.model";
import { OverlayItem } from "../shared/overlay-item.model";

onNet('armoury-overlay:update-item', (data: OverlayItem) => {
    SendNuiMessage(JSON.stringify({
        type: 'update',
        stat: data.id,
        icon: data.icon,
        value: data.value.toString()
    }));
});

onNet('armoury-overlay:set-message', (data: OverlayMessage) => {
    SendNuiMessage(JSON.stringify({
        type: 'addmessage',
        message: JSON.stringify({
            id: data.id,
            content: data.content
        })
    }));
});

onNet('armoury-overlay:delete-message', (data: OverlayMessage) => {
    SendNuiMessage(JSON.stringify({
        type: 'removemessage',
        message: JSON.stringify({
            id: data.id
        })
    }));
});

onNet(`${GetCurrentResourceName()}:show-money-overlay`, (gain: number) => {
    SendNuiMessage(JSON.stringify({
        type: 'moneygain',
        gain
    }));
});
