(()=>{"use strict";const e={onAccountAuthenticate:"authentication:account-success",onPlayerConnect:"playerJoining",onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped",onResourceStop:"onResourceStop",onContextMenuItemPressed:"armoury-overlay:context-menu-item-pressed",onPlayerEnterVehicle:"armoury:onPlayerEnterVehicle",onPlayerExitVehicle:"armoury:onPlayerExitVehicle",onPlayerClientsidedCacheLoaded:"armoury:player-resource-cache-loaded",onPlayerStartTowVehicle:"armoury:onPlayerStartTowVehicle",onPlayerStopTowVehicle:"armoury:onPlayerStopTowVehicle"};var t;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(t||(t={}));const r=new Map,o=new Map,s=new Map;function n(e){return function(n){return class extends n{constructor(...i){super(...i),this.translationFile=null==e?void 0:e.translationFile,r.has(n)&&r.get(n).forEach((([e,r,o])=>{o===t.CLIENT_TO_CLIENT?on(r,super[e].bind(this)):onNet(r,super[e].bind(this))})),o.has(n)&&o.get(n).forEach((e=>{exports(e,super[e].bind(this))})),s.has(n)&&s.get(n).forEach((([e,t])=>{IsDuplicityVersion()?RegisterCommand(((null==t?void 0:t.isKeyBinding)?"+":"")+e.toLowerCase()+((null==t?void 0:t.suffix)||""),((r,o,s)=>{(null==t?void 0:t.adminLevelRequired)&&Number(global.exports.authentication.getPlayerInfo(r,"adminLevel"))<(null==t?void 0:t.adminLevelRequired)||super[e].call(this,r,o,s)}),!1):RegisterCommand(((null==t?void 0:t.isKeyBinding)?"+":"")+e.toLowerCase()+((null==t?void 0:t.suffix)||""),((t,r,o)=>{super[e].call(this,r,o)}),!1)}))}}}}function i(o){return function(s,n,i){const a=e[n]||(null==o?void 0:o.eventName),l=(null==o?void 0:o.direction)||t.CLIENT_TO_SERVER;(null==a?void 0:a.length)?(r.has(s.constructor)||r.set(s.constructor,[]),r.get(s.constructor).some((([e,t,r])=>e===n))||r.get(s.constructor).push([n,a,l])):console.error(`${n} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}var a=function(e,t,r,o){var s,n=arguments.length,i=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(i=(n<3?s(i):n>3?s(t,r,i):s(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let l=class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,r,o){RegisterCommand(e,((e,o,s)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||r(e,o,s)}),o)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}setRoutingBucket(e,t){SetEntityRoutingBucket(GetPlayerPed(e),t),TriggerClientEvent(`${GetCurrentResourceName()}:set-routing-bucket`,e,t)}}{constructor(){super(...arguments),this._virtualWorldsWithPlayers=new Map}get virtualWorldsWithPlayers(){return this._virtualWorldsWithPlayers}onPlayerEnteredScope(e){TriggerClientEvent(`${GetCurrentResourceName()}:refresh-virtual-world`,e.for)}setPlayerVirtualWorld(e,t){const r=this.getPlayerVirtualWorld(e);isNaN(r)||this._virtualWorldsWithPlayers.set(r,(this._virtualWorldsWithPlayers.has(r)?this._virtualWorldsWithPlayers.get(r):[]).filter((t=>t!==e)));const o=[...this._virtualWorldsWithPlayers.has(t)?this._virtualWorldsWithPlayers.get(t):[],e];this._virtualWorldsWithPlayers.set(t,o),global.exports.authentication.setPlayerInfo(e,"virtualWorld",t)}getPlayerVirtualWorld(e){return Math.max(0,Number(global.exports.authentication.getPlayerInfo(e,"virtualWorld")))}removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}};a([i({eventName:"playerEnteredScope"})],l.prototype,"onPlayerEnteredScope",null),l=a([n()],l);var c=function(e,t,r,o){var s,n=arguments.length,i=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(i=(n<3?s(i):n>3?s(t,r,i):s(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let u=class extends l{constructor(){super(...arguments),this._translationLanguage="en",this._clientsidedResourceMap=new Map}get translationLanguage(){return this._translationLanguage}get clientsidedResourceMap(){return this._clientsidedResourceMap}getPlayerClientsidedCacheKey(e,t){if(this._clientsidedResourceMap.has(e)){const r=this._clientsidedResourceMap.get(e);if(r[t])return r[t]}return null}updatePlayerClientsidedCacheKey(e,t,r){const o=this._clientsidedResourceMap.has(e)&&this._clientsidedResourceMap.get(e)||{};o[t]=r,this._clientsidedResourceMap.set(e,o),TriggerClientEvent("armoury-overlay:update-resource-metadata",e,GetCurrentResourceName(),t,r)}onPlayerClientsidedCacheLoaded(e){e[GetCurrentResourceName()]&&this._clientsidedResourceMap.set(source,e[GetCurrentResourceName()])}onPlayerDisconnect(){this._clientsidedResourceMap.has(source)&&this._clientsidedResourceMap.delete(source)}translate(e,t){let r=this.translationFile[this._translationLanguage][e];return t&&Object.keys(t).forEach((e=>{r=r.replace(`{${e}}`,t[e])})),r}setTranslationLanguage(e){this._translationLanguage=e}};c([i()],u.prototype,"onPlayerClientsidedCacheLoaded",null),c([i()],u.prototype,"onPlayerDisconnect",null),u=c([n()],u);const d=(e,t,r,o,s,n,i)=>h([e,t,r,o,s,n])<=i,h=e=>{var t=e[3]-e[0],r=e[4]-e[1],o=e[5]-e[2];return Math.hypot(t,r,o)};var p,y;!function(e){e[e.CARGO=0]="CARGO",e[e.ELECTRICITY=1]="ELECTRICITY",e[e.OIL=2]="OIL"}(p||(p={})),function(e){e[e.MAIN=0]="MAIN",e[e.LEGAL=1]="LEGAL",e[e.ILLEGAL=2]="ILLEGAL"}(y||(y={})),new Map([[p.OIL,[-1207431159,-730904777,1956216962]],[p.ELECTRICITY,[-2140210194]],[p.CARGO,[-1770643266,-877478386]]]);const g=[{pos:[1367.4593505859375,-1867.7406005859375,55.172119140625],type:p.OIL},{pos:[1398.2901611328125,-2062.23291015625,50.5216064453125],type:p.OIL},{pos:[2678.835205078125,1602.778076171875,23.03955078125],type:p.OIL},{pos:[2815.7802734375,1561.4505615234375,23.10693359375],type:p.ELECTRICITY},{pos:[2046.909912109375,3183.61328125,43.5626220703125],type:p.CARGO},{pos:[1567.79345703125,3791.630859375,32.8125],type:p.CARGO},{pos:[346.8791198730469,3418.773681640625,34.952392578125],type:p.ELECTRICITY},{pos:[258.0659484863281,2849.630859375,42.13037109375],type:p.ELECTRICITY},{pos:[592.5758056640625,2733.454833984375,40.6138916015625],type:p.CARGO}],R={OIL:.1,ELECTRICITY:.15,"CARGO 1":.12,"CARGO 2":.15,"CARGO 3":.24,"CARGO 4":.28};let C=class extends u{constructor(){super(),this.truckers=new Map,this.savedPositions=new Map,this.assignEvents()}assignEvents(){onNet(`${GetCurrentResourceName()}:quick-start`,(e=>{const t=GetEntityCoords(GetPlayerPed(source),!0);let r;if(Array.from(this.savedPositions.keys()).forEach((o=>{p[e]===this.savedPositions.get(o).type&&d(t[0],t[1],t[2],o[0],o[1],o[2],15)&&(r=this.savedPositions.get(o).pos)})),!r){const o=g.filter((r=>!d(t[0],t[1],t[2],r.pos[0],r.pos[1],r.pos[2],30)&&r.type===this.decideDeliveryType(e)));r=o[Math.floor(Math.random()*o.length)].pos,this.savedPositions.set(t,{pos:r,type:p[e]})}this.truckers.set(source,{distance:h([t[0],t[1],t[2],r[0],r[1],r[2]]),type:e}),console.log(this.truckers.get(source)),TriggerClientEvent("trucker-job:begin-job",source,{X:r[0],Y:r[1],Z:r[2]},e),setTimeout((()=>{this.savedPositions.delete(t)}),1e4)})),onNet(`${GetCurrentResourceName()}:get-job`,(()=>{global.exports.authentication.setPlayerInfo(source,"job","trucker",!1),TriggerClientEvent("trucker-job:job-assigned",source)})),onNet(`${GetCurrentResourceName()}:job-finished`,(()=>{const e=GetEntityCoords(GetPlayerPed(source),!0);g.forEach((t=>{if(d(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],15))return exports.authentication.setPlayerInfo(source,"cash",Number(exports.authentication.getPlayerInfo(source,"cash"))+(Math.floor(this.truckers.get(source).distance*R[this.truckers.get(source).type])+Math.floor(Math.random()*R[this.truckers.get(source).type]*20)),!1),TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`,source),global.exports.skills.incrementPlayerSkill(source,"trucker",.05),void(this.truckers.has(source)&&this.truckers.delete(source))}))}))}decideDeliveryType(e){switch(e){case"OIL":return 0;case"ELECTRICITY":return 1;default:return 2}}};C=function(e,t,r,o){var s,n=arguments.length,i=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,o);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(i=(n<3?s(i):n>3?s(t,r,i):s(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i}([n()],C),new C})();