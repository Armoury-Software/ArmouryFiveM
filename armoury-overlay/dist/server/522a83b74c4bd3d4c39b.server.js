(()=>{"use strict";exports("updateItem",((e,r)=>{TriggerClientEvent("armoury-overlay:update-item",e,r)})),exports("showMoneyGainOverlay",((e,r)=>{TriggerClientEvent(`${GetCurrentResourceName()}:show-money-overlay`,e,r)})),exports("setMessage",((e,r)=>{TriggerClientEvent("armoury-overlay:set-message",e,r)})),exports("deleteMessage",((e,r)=>{TriggerClientEvent("armoury-overlay:delete-message",e,r)}))})();