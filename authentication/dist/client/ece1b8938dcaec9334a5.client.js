(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}();var t=function(e,t,n,a){return new(n||(n=Promise))((function(i,o){function r(e){try{c(a.next(e))}catch(e){o(e)}}function s(e){try{c(a.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(r,s)}c((a=a.apply(e,t||[])).next())}))};let n,a,i=!1;const o=e=>{e&&(RenderScriptCams(!1,!1,0,!0,!0),SetCamActive(n,!1),n=NaN),LeaveCursorMode(),i=!1,StartAudioScene("DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE")};o(),n=CreateCam("DEFAULT_SCRIPTED_CAMERA",!0),SetCamCoord(n,879.82177734375,-1930.485595703125,96.08704376220703),PointCamAtCoord(n,1404.57763671875,-1877.9915771484375,72.19271850585938),SetCamActive(n,!0),RenderScriptCams(!0,!1,0,!0,!0),DisplayRadar(!1),setTimeout((()=>{emit("armoury-overlay:play-background-music","https://armoury.ro/fivem/ambient/authentication.mp3",.05)}),1e3),setTimeout((()=>{EnterCursorMode(),SetNuiFocus(!0,!0),SetNuiFocusKeepInput(!1),i=!0,a=setTick((()=>t(void 0,void 0,void 0,(function*(){DisableControlAction(0,1,i),DisableControlAction(0,2,i),DisableControlAction(0,142,i),DisableControlAction(0,18,i),DisableControlAction(0,322,i),DisableControlAction(0,106,i),i||(clearTick(a),SetNuiFocus(!1,!1))}))))}),3e3),RegisterNuiCallbackType("authenticate"),on("__cfx_nui:authenticate",((e,t)=>{TriggerServerEvent("authentication:authenticate",e),t("ok")})),onNet(`${GetCurrentResourceName()}:fade-out-in`,(()=>t(void 0,void 0,void 0,(function*(){var e;DoScreenFadeOut(500),yield(e=1500,new Promise((t=>setTimeout(t,e)))),DoScreenFadeIn(500)})))),onNet("authentication:account-success-client",(()=>{SendNuiMessage(JSON.stringify({type:"dismiss"})),o(!0)})),onNet("authentication:spawn-player",(t=>{t?(globalThis.exports.spawnmanager.setAutoSpawnCallback((()=>{e.g.exports.spawnmanager.spawnPlayer({x:t[0],y:t[1],z:t[2],skipFade:!1})})),e.g.exports.spawnmanager.forceRespawn()):e.g.exports.spawnmanager.spawnPlayer(),t[3]&&SetEntityHeading(PlayerPedId(),Number(t[3])),DisplayRadar(!0)})),onNet("authentication:success",(()=>{StopAudioScene("DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE"),emit("armoury-overlay:stop-background-music")})),onNet("authentication:register-error",(()=>{SendNuiMessage(JSON.stringify({type:"error",message:"Email already in use."}))})),onNet("authentication:login-error",(()=>{SendNuiMessage(JSON.stringify({type:"error",message:"Email and password combination is incorrect."}))}))})();