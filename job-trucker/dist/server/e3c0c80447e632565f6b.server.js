(()=>{"use strict";const e={onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped",onResourceStop:"onResourceStop",onContextMenuItemPressed:"armoury-overlay:context-menu-item-pressed"};var t;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(t||(t={}));const o=new Map,s=new Map;function r(){return function(e){return class extends e{constructor(...r){super(...r),o.has(e)&&o.get(e).forEach((([e,o,s])=>{s===t.CLIENT_TO_CLIENT?on(o,super[e].bind(this)):onNet(o,super[e].bind(this))})),s.has(e)&&s.get(e).forEach((e=>{exports(e,super[e].bind(this))}))}}}}function n(s){return function(r,n,i){const a=e[n]||(null==s?void 0:s.eventName),c=(null==s?void 0:s.direction)||t.CLIENT_TO_SERVER;(null==a?void 0:a.length)?(o.has(r.constructor)||o.set(r.constructor,[]),o.get(r.constructor).some((([e,t,o])=>e===n))||o.get(r.constructor).push([n,a,c])):console.error(`${n} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}var i=function(e,t,o,s){var r,n=arguments.length,i=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(i=(n<3?r(i):n>3?r(t,o,i):r(t,o))||i);return n>3&&i&&Object.defineProperty(t,o,i),i};let a=class extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,o,s){RegisterCommand(e,((e,s,r)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||o(e,s,r)}),s)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(){super(),this._jobInternalId="",this.playersAssignedToVehicles=new Map,this._jobInternalId=GetCurrentResourceName().split("-").slice(1).join("-"),GetCurrentResourceName().includes("job-")||console.error("You are using a Faction controller but its name does NOT comply with the naming 'job-<jobInternalId>'. The resource may not work properly.")}get jobInternalId(){return this._jobInternalId}get spawnedVehicles(){return this.playersAssignedToVehicles}onResourceStop(e){e===GetCurrentResourceName()&&this.removeVehicles()}onPlayerDisconnect(){this.onJobCancel(source)}onMapVehicle(e,t){const o=NetworkGetEntityFromNetworkId(t);this.playersAssignedToVehicles.has(e)&&this.destroyPlayerVehicle(e),this.playersAssignedToVehicles.set(e,{vehicleEntityId:o,metadata:{}})}onUpdateVehicles(e,t){Array.from(Object.keys(t)).forEach((e=>{t[e]=NetworkGetEntityFromNetworkId(t[e])})),this.spawnedVehicles.set(e,Object.assign(Object.assign({},this.spawnedVehicles.get(e)),{metadata:t}))}onDestroyVehicle(e){this.destroyPlayerVehicle(e)}onJobCancel(e){this.destroyPlayerVehicle(e),TriggerClientEvent(`${GetCurrentResourceName()}:cancel-waypoint-and-action`,e)}assignJob(e){global.exports.authentication.setPlayerInfo(e,"job",this._jobInternalId,!1),TriggerClientEvent(`${GetCurrentResourceName()}:job-assigned`,e)}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e)}removeVehicles(){Array.from(this.playersAssignedToVehicles.keys()).forEach((e=>{this.removeVehicle(e)}))}destroyPlayerVehicle(e){const t=this.playersAssignedToVehicles.get(e).vehicleEntityId;this.removeVehicle(t),this.playersAssignedToVehicles.get(e).metadata&&Array.from(Object.keys(this.playersAssignedToVehicles.get(e).metadata)).forEach((t=>{this.removeVehicle(this.playersAssignedToVehicles.get(e).metadata[t])})),this.playersAssignedToVehicles.delete(e)}};i([n()],a.prototype,"onResourceStop",null),i([n()],a.prototype,"onPlayerDisconnect",null),i([n({eventName:`${GetCurrentResourceName()}:add-job-vehicle-to-map`})],a.prototype,"onMapVehicle",null),i([n({eventName:`${GetCurrentResourceName()}:update-job-vehicle-in-map`})],a.prototype,"onUpdateVehicles",null),i([n({eventName:`${GetCurrentResourceName()}:destroy-job-vehicle-from-map`})],a.prototype,"onDestroyVehicle",null),i([n({eventName:`${GetCurrentResourceName()}:cancel-job`})],a.prototype,"onJobCancel",null),a=i([r()],a);const c=(e,t,o,s,r,n,i)=>e>=s-i&&e<=s+i&&t>=r-i&&t<=r+i&&o>=n-i&&o<=n+i;var l,u;!function(e){e[e.CARGO=0]="CARGO",e[e.ELECTRICITY=1]="ELECTRICITY",e[e.OIL=2]="OIL"}(l||(l={})),function(e){e[e.MAIN=0]="MAIN",e[e.LEGAL=1]="LEGAL",e[e.ILLEGAL=2]="ILLEGAL"}(u||(u={})),new Map([[l.OIL,[-1207431159,-730904777,1956216962]],[l.ELECTRICITY,[-2140210194]],[l.CARGO,[-1770643266,-877478386]]]);const h=[{pos:[1367.4593505859375,-1867.7406005859375,55.172119140625],type:l.OIL},{pos:[1398.2901611328125,-2062.23291015625,50.5216064453125],type:l.OIL},{pos:[2678.835205078125,1602.778076171875,23.03955078125],type:l.OIL},{pos:[2815.7802734375,1561.4505615234375,23.10693359375],type:l.ELECTRICITY},{pos:[2046.909912109375,3183.61328125,43.5626220703125],type:l.CARGO},{pos:[1567.79345703125,3791.630859375,32.8125],type:l.CARGO},{pos:[346.8791198730469,3418.773681640625,34.952392578125],type:l.ELECTRICITY},{pos:[258.0659484863281,2849.630859375,42.13037109375],type:l.ELECTRICITY},{pos:[592.5758056640625,2733.454833984375,40.6138916015625],type:l.CARGO}],p={OIL:.1,ELECTRICITY:.15,"CARGO 1":.12,"CARGO 2":.15,"CARGO 3":.24,"CARGO 4":.28};var d=function(e,t,o,s){var r,n=arguments.length,i=n<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(i=(n<3?r(i):n>3?r(t,o,i):r(t,o))||i);return n>3&&i&&Object.defineProperty(t,o,i),i};let y=class extends a{constructor(){super(),this.truckers=new Map,this.savedPositions=new Map}onQuickStart(e){const t=GetEntityCoords(GetPlayerPed(source),!0);let o;if(Array.from(this.savedPositions.keys()).forEach((s=>{l[e]===this.savedPositions.get(s).type&&c(t[0],t[1],t[2],s[0],s[1],s[2],15)&&(o=this.savedPositions.get(s).pos)})),!o){const s=h.filter((o=>!c(t[0],t[1],t[2],o.pos[0],o.pos[1],o.pos[2],30)&&o.type===this.decideDeliveryType(e)));o=s[Math.floor(Math.random()*s.length)].pos,this.savedPositions.set(t,{pos:o,type:l[e]})}var s,r,n,i;this.truckers.set(source,{distance:(s=[t[0],t[1],t[2],o[0],o[1],o[2]],r=s[3]-s[0],n=s[4]-s[1],i=s[5]-s[2],Math.hypot(r,n,i)),type:e}),TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`,source,{X:o[0],Y:o[1],Z:o[2]},e),setTimeout((()=>{this.savedPositions.delete(t)}),1e4)}onGetJob(){this.assignJob(source)}onFinishedJob(){const e=GetEntityCoords(GetPlayerPed(source),!0);h.forEach((t=>{if(c(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],15))return exports.authentication.setPlayerInfo(source,"cash",Number(exports.authentication.getPlayerInfo(source,"cash"))+(Math.floor(this.truckers.get(source).distance*p[this.truckers.get(source).type])+Math.floor(Math.random()*p[this.truckers.get(source).type]*20)),!1),TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`,source),global.exports.skills.incrementPlayerSkill(source,"trucker",.05),void(this.truckers.has(source)&&this.truckers.delete(source))}))}decideDeliveryType(e){switch(e){case"OIL":return 0;case"ELECTRICITY":return 1;default:return 2}}};d([n({eventName:`${GetCurrentResourceName()}:quick-start`})],y.prototype,"onQuickStart",null),d([n({eventName:`${GetCurrentResourceName()}:get-job`})],y.prototype,"onGetJob",null),d([n({eventName:`${GetCurrentResourceName()}:job-finished`})],y.prototype,"onFinishedJob",null),y=d([r()],y),new y})();