(()=>{"use strict";const e={onAccountAuthenticate:"authentication:account-success",onPlayerConnect:"playerJoining",onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped",onResourceStop:"onResourceStop",onContextMenuItemPressed:"armoury-overlay:context-menu-item-pressed",onPlayerEnterVehicle:"armoury:onPlayerEnterVehicle",onPlayerExitVehicle:"armoury:onPlayerExitVehicle",onPlayerClientsidedCacheLoaded:"armoury:player-resource-cache-loaded"};var t;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(t||(t={}));const i=new Map,r=new Map,s=new Map;function o(e){return function(o){return class extends o{constructor(...n){super(...n),this.translationFile=null==e?void 0:e.translationFile,i.has(o)&&i.get(o).forEach((([e,i,r])=>{r===t.CLIENT_TO_CLIENT?on(i,super[e].bind(this)):onNet(i,super[e].bind(this))})),r.has(o)&&r.get(o).forEach((e=>{exports(e,super[e].bind(this))})),s.has(o)&&s.get(o).forEach((([e,t])=>{IsDuplicityVersion()?RegisterCommand(e.toLowerCase(),((i,r,s)=>{Number(global.exports.authentication.getPlayerInfo(i,"adminLevel"))<t||super[e].call(this,i,r,s)}),!1):RegisterCommand(e.toLowerCase(),((t,i,r)=>{super[e].call(this,i,r)}),!1)}))}}}}function n(r){return function(s,o,n){const a=e[o]||(null==r?void 0:r.eventName),l=(null==r?void 0:r.direction)||t.CLIENT_TO_SERVER;(null==a?void 0:a.length)?(i.has(s.constructor)||i.set(s.constructor,[]),i.get(s.constructor).some((([e,t,i])=>e===o))||i.get(s.constructor).push([o,a,l])):console.error(`${o} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}function a(){return function(e,t,i){r.has(e.constructor)||r.set(e.constructor,[]),r.get(e.constructor).some((e=>e===t))||r.get(e.constructor).push(t)}}function l(e=0){return function(t,i,r){s.has(t.constructor)||s.set(t.constructor,[]),s.get(t.constructor).some((([e,t])=>e===i))||s.get(t.constructor).push([i,e])}}const c=e=>!/^\s*$/.test(e)&&(e=(e=(e=e.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(e));var d=function(e,t,i,r){var s,o=arguments.length,n=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let h=class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,i,r){RegisterCommand(e,((e,r,s)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||i(e,r,s)}),r)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}setRoutingBucket(e,t){SetEntityRoutingBucket(GetPlayerPed(e),t),TriggerClientEvent(`${GetCurrentResourceName()}:set-routing-bucket`,e,t)}}{constructor(){super(...arguments),this._virtualWorldsWithPlayers=new Map}get virtualWorldsWithPlayers(){return this._virtualWorldsWithPlayers}onPlayerEnteredScope(e){TriggerClientEvent(`${GetCurrentResourceName()}:refresh-virtual-world`,e.for)}setPlayerVirtualWorld(e,t){const i=this.getPlayerVirtualWorld(e);isNaN(i)||this._virtualWorldsWithPlayers.set(i,(this._virtualWorldsWithPlayers.has(i)?this._virtualWorldsWithPlayers.get(i):[]).filter((t=>t!==e)));const r=[...this._virtualWorldsWithPlayers.has(t)?this._virtualWorldsWithPlayers.get(t):[],e];this._virtualWorldsWithPlayers.set(t,r),global.exports.authentication.setPlayerInfo(e,"virtualWorld",t)}getPlayerVirtualWorld(e){return Math.max(0,Number(global.exports.authentication.getPlayerInfo(e,"virtualWorld")))}removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}};d([n({eventName:"playerEnteredScope"})],h.prototype,"onPlayerEnteredScope",null),h=d([o()],h);var u=function(e,t,i,r){var s,o=arguments.length,n=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let p=class extends h{constructor(){super(...arguments),this._translationLanguage="ro",this._clientsidedResourceMap=new Map}get translationLanguage(){return this._translationLanguage}get clientsidedResourceMap(){return this._clientsidedResourceMap}getPlayerClientsidedCacheKey(e,t){if(this._clientsidedResourceMap.has(e)){const i=this._clientsidedResourceMap.get(e);if(i[t])return i[t]}return null}updatePlayerClientsidedCacheKey(e,t,i){const r=this._clientsidedResourceMap.has(e)&&this._clientsidedResourceMap.get(e)||{};r[t]=i,this._clientsidedResourceMap.set(e,r),TriggerClientEvent("armoury-overlay:update-resource-metadata",e,GetCurrentResourceName(),t,i)}onPlayerClientsidedCacheLoaded(e){e[GetCurrentResourceName()]&&this._clientsidedResourceMap.set(source,e[GetCurrentResourceName()])}onPlayerDisconnect(){this._clientsidedResourceMap.has(source)&&this._clientsidedResourceMap.delete(source)}translate(e,t){let i=this.translationFile[this._translationLanguage][e];return t&&Object.keys(t).forEach((e=>{i=i.replace(`{${e}}`,t[e])})),i}setTranslationLanguage(e){this._translationLanguage=e}};u([n()],p.prototype,"onPlayerClientsidedCacheLoaded",null),u([n()],p.prototype,"onPlayerDisconnect",null),p=u([o()],p);var y=function(e,t,i,r){var s,o=arguments.length,n=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n},g=function(e,t,i,r){return new(i||(i=Promise))((function(s,o){function n(e){try{l(r.next(e))}catch(e){o(e)}}function a(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(n,a)}l((r=r.apply(e,t||[])).next())}))};let E=class extends p{constructor(e,t=!1){super(),this.dbTableName=e,this._entities=[],this._cachedProperties=[],this._playerToEntityBindings=new Map,this.computeTableProperties(),t&&this.loadDBEntities()}get entities(){return this._entities}get cachedProperties(){return this._cachedProperties}get playerToEntityBindings(){return this._playerToEntityBindings}getEntities(){return this._entities}createEntity(e,t){return(()=>g(this,void 0,void 0,(function*(){try{let i=this.getEntityProperties(e),r=this.getEntityPropertiesValues(e,i);t&&(i=["id",...i],r=[t.toString(),...r]);const s=yield global.exports.oxmysql.insert_async(`INSERT INTO \`${this.dbTableName}\` (${i.join(", ")}) VALUES (${Array(i.length).fill("?").join(", ")})`,r),o=Object.assign(Object.assign({},e),{id:t||s});return this._entities.push(o),this.syncWithClients(),o}catch(e){return console.log(e),null}})))()}removeEntity(e){return(()=>g(this,void 0,void 0,(function*(){try{const t=yield global.exports.oxmysql.query_async(`DELETE FROM \`${this.dbTableName}\` WHERE id = ?`,[e.id]);return this._entities=this._entities.filter((t=>t.id!==e.id)),this.syncWithClients(),!!t}catch(e){return console.log(e),!1}})))()}saveDBEntityAsync(e){return(()=>g(this,void 0,void 0,(function*(){try{const t=this.getEntityByDBId(e),i=this.getEntityProperties(t),r=this.getEntityPropertiesValues(t,i),s=" = ?, ",o=yield global.exports.oxmysql.update_async(`UPDATE \`${this.dbTableName}\` SET ${i.join(s).concat(s).slice(0,-2)} WHERE id = ?`,[...r,t.id]);return o&&this.syncWithClients(),o>0}catch(e){return console.log(e),!1}})))()}getEntityByDBId(e){return this._entities.find((t=>t.id===e))}loadDBEntityFor(e,t="id",i){return g(this,void 0,void 0,(function*(){const r=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\` WHERE ${t} = ?`,[e])).map((e=>(Object.keys(e).forEach((t=>{e[t]=JSON.parse(c(e[t].toString())?e[t]:`"${e[t]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),e)));return(null==r?void 0:r.length)?(r.forEach((e=>{this._entities.push(e),i&&this.bindEntityToPlayerByEntityId(e.id,i)})),setTimeout((()=>{this.syncWithClients()}),2e3),(null==r?void 0:r.length)>1?r:r[0]):null}))}loadDBEntities(){return g(this,void 0,void 0,(function*(){const e=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\``,[])).map((e=>(Object.keys(e).forEach((t=>{e[t]=JSON.parse(c(e[t].toString())?e[t]:`"${e[t]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),e)));return(null==e?void 0:e.length)&&(this._entities=e,setTimeout((()=>{this.syncWithClients()}),2e3)),this._entities}))}getEntityProperties(e){const t=[];for(let i in e)"id"===i||this._cachedProperties.length&&!this._cachedProperties.includes(i)||t.push(i);return t}getEntityPropertiesValues(e,t){return t.map((t=>Array.isArray(e[t])||"object"==typeof e[t]?JSON.stringify(e[t]):e[t].toString()))}syncWithClients(e){TriggerClientEvent(`${GetCurrentResourceName()}:db-send-entities`,e||-1,this.entities)}bindEntityToPlayer(e,t){this.entities.includes(e)&&this.bindEntityToPlayerByEntityId(e.id,t)}bindEntityToPlayerByEntityId(e,t){this._entities.some((t=>t.id===e))&&(this._playerToEntityBindings.has(t)?this._playerToEntityBindings.set(t,[...this._playerToEntityBindings.get(t),e]):this._playerToEntityBindings.set(t,[e]))}onBoundEntityDestroyed(e,t){}onPlayerAuthenticate(e,t){this._entities.length&&this.syncWithClients(e)}onPlayerDisconnect(){this._playerToEntityBindings.has(source)&&((this._playerToEntityBindings.has(source)?this._playerToEntityBindings.get(source):[]).forEach((e=>{const t=this._entities.find((t=>t.id===e));t&&(this.onBoundEntityDestroyed(t,source),this._entities.splice(this._entities.indexOf(t),1))})),this._playerToEntityBindings.delete(source))}computeTableProperties(){return g(this,void 0,void 0,(function*(){const e=yield global.exports.oxmysql.query_async(`DESCRIBE ${this.dbTableName}`,[]);e?e.forEach((e=>{this._cachedProperties.push(e.Field)})):console.error(`[SQL ERROR:] computeTableProperties for ${GetCurrentResourceName()} did not work.`)}))}};y([a()],E.prototype,"getEntities",null),y([n()],E.prototype,"onPlayerAuthenticate",null),y([n()],E.prototype,"onPlayerDisconnect",null),E=y([o()],E);const m={landstalker:{brand:"Toyota",description:"LandCruiser Prado, 2009",price:125e4},"17r35":{brand:"Nissan",description:"GTR R35, 2017",price:25e5},"18camaro":{brand:"Chevrolet",description:"Camaro ZL1, 2018",price:25e5},"68firebird":{brand:"Pontiac",description:"Firebird, 1968",price:25e5},"69nova":{brand:"Chevrolet",description:"Nova, 1969",price:25e5},bmw507:{brand:"BMW",description:"507 2.0, 1959",price:25e5},bmwm5e60:{brand:"BMW",description:"M5 E60, 2008",price:25e5},brz13:{brand:"Subaru",description:"BRZ, 2013",price:25e5},camarozl1:{brand:"Chevrolet",description:"Camaro ZL1, 2017",price:25e5},celisupra:{brand:"Toyota",description:"Celica Supra MKII, 1984",price:25e5},chrxfire:{brand:"Chrysler",description:"Crossfire, 2004",price:25e5},cobaltss:{brand:"Chevrolet",description:"Cobalt SS, 2006",price:25e5},dubsta2:{brand:"Mercedes",description:"G AMG 2015",price:25e5},fer612sc:{brand:"Ferrari",description:"612 Scaglietti, 2004",price:25e5},forgt50020:{brand:"Ford",description:"Mustang Shelby GT500, 2020",price:25e5},fto:{brand:"Mitsubishi",description:"FTO GP Version-R, 1997",price:25e5},hondelsol:{brand:"Honda",description:"CR-X Del Sol, 1997",price:25e5},lexlfa10:{brand:"Lexus",description:"LFA, 2010",price:25e5},lexsc430:{brand:"Lexus",description:"SC 430 ZC40, 2001",price:25e5},m686eu:{brand:"BMW",description:"M635 CSi, 1986",price:25e5},mercw126:{brand:"Mercedes",description:"560SEL w126, 1990",price:25e5},mr2sw20:{brand:"Toyota",description:"MR-2 GT SW-20, 1991",price:25e5},ninef:{brand:"Audi",description:"R8, 2018",price:25e5},nisgtsrr31:{brand:"Nissan",description:"Skyline GTS-R R31, 1989",price:25e5},por911:{brand:"Porsche",description:"911 Carrera S, 2018",price:25e5},porcgt03:{brand:"Porsche",description:"Carrera GT 980, 2003",price:25e5},silvias15:{brand:"Nissan",description:"Silvia S15 Spec-R, 1999",price:25e5},slsamg:{brand:"Mercedes",description:"SLS AMG, 2011",price:25e5},sublegab4:{brand:"Subaru",description:"Legacy 2.0 GT B4, 2005",price:25e5},zentorno:{brand:"Lamborghini",description:"Aventador LP700-4, 2013",price:25e5}};var f=function(e,t,i,r){var s,o=arguments.length,n=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(n=(o<3?s(n):o>3?s(t,i,n):s(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n};let b=class extends E{constructor(e){super(e),this.loadedVehicles=new Map,this.loadedVehiclesDBIdsWithSpawnedIds=new Map,setTimeout((()=>{const e=global.exports.authentication.getAuthenticatedPlayers(!0);e&&Object.keys(e).forEach((t=>{const i=Number(t),r=e[t];this.onPlayerAuthenticate(i,r)}))}),1e3)}createVehicle(e,t,i,r,s,o,n,a){const l=CreateVehicle(e,s,o,n,a,!0,!0);return this.createEntity({id:0,modelHash:e,owner:Number(global.exports.authentication.getPlayerInfo(t,"id")),primaryColor:i,secondaryColor:r,posX:s,posY:o,posZ:n,posH:a,plate:"ARMOURY",locked:!1,items:[]}).then((e=>{this.loadVehicle(e,t,l)})),SetVehicleColours(l,i,r),l}getVehicleItems(e){if(this.loadedVehicles.has(e)){const t=this.loadedVehicles.get(e).id;return this.getEntityByDBId(t).items}return[]}updateVehicleItems(e,t){if(this.loadedVehicles.has(e)){const i=this.loadedVehicles.get(e).id;this.getEntityByDBId(i).items=t,this.loadedVehicles.set(e,Object.assign(Object.assign({},this.loadedVehicles.get(e)),{items:t})),this.saveDBEntityAsync(i)}}getVehiclesHashesFromArray(e){return e.map((e=>this.getEntityByDBId(e).modelHash))}getVehicleHashKeyFromVehicleDbId(e){const t=this.getEntityByDBId(e);return t?Array.from(Object.keys(m)).find((e=>GetHashKey(e)===t.modelHash)):""}onBoundEntityDestroyed(e,t){this.removeLoadedVehiclesBoundToPlayer(t)}onVehicleShouldUnlockForPlayer(e){var t;const i=source,[r,s,o]=GetEntityCoords(GetPlayerPed(i)),[n,a,l]=GetEntityCoords(NetworkGetEntityFromNetworkId(e)),c=NetworkGetEntityFromNetworkId(e),d=Array.from(this.loadedVehicles.keys()).find((e=>e===c));var h,u,p,y;u=(h=[r,s,o,n,a,l])[3]-h[0],p=h[4]-h[1],y=h[5]-h[2],Math.hypot(u,p,y)<=10&&d&&global.exports.authentication.getPlayerInfo(i,"vehiclekeys").includes(null===(t=this.loadedVehicles.get(d))||void 0===t?void 0:t.id)&&this.toggleLockOfThisVehicle(NetworkGetEntityFromNetworkId(e),i,!1)}onPlayerEnterVehicle(e){const t=source,i=NetworkGetEntityFromNetworkId(e);if(this.loadedVehicles.has(i)){const r=this.loadedVehicles.get(i).id;this.playerToEntityBindings.has(t)&&this.playerToEntityBindings.get(t).includes(r)&&TriggerClientEvent(`${GetCurrentResourceName()}:remove-owned-vehicle-cached-position`,t,e)}}onPlayerExitVehicle(e,t){const i=source,r=NetworkGetEntityFromNetworkId(e);if(t&&this.loadedVehicles.has(r)){const t=this.loadedVehicles.get(r).id,s=this.getEntityByDBId(t),[o,n,a]=GetEntityCoords(r,!0),l=GetEntityHeading(r);s.posX=o,s.posY=n,s.posZ=a,s.posH=l,this.loadedVehicles.set(r,Object.assign(Object.assign({},this.loadedVehicles.get(r)),{posX:s.posX,posY:s.posY,posZ:s.posZ,posH:s.posH})),this.saveDBEntityAsync(t),this.playerToEntityBindings.has(i)&&this.playerToEntityBindings.get(i).includes(t)&&TriggerClientEvent(`${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,i,e,[o,n,a],GetEntityModel(r))}}onPlayerAuthenticate(e,t){super.onPlayerAuthenticate(e,t),this.loadDBEntityFor(t.id,"owner",e).then((t=>{if(t)if(Array.isArray(t))t.forEach((t=>{const i=this.loadVehicle(t,e);setTimeout((()=>{TriggerClientEvent(`${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,e,NetworkGetNetworkIdFromEntity(i),GetEntityCoords(i),GetEntityModel(i))}),5e3)}));else{const i=this.loadVehicle(t,e);setTimeout((()=>{TriggerClientEvent(`${GetCurrentResourceName()}:update-owned-vehicle-cached-position`,e,NetworkGetNetworkIdFromEntity(i),GetEntityCoords(i),GetEntityModel(i))}),5e3)}}))}onResourceStop(e){e===GetCurrentResourceName()&&(console.log("Resource stopped. Attempting to remove all loaded vehicles.."),Array.from(this.loadedVehicles.keys()).forEach((e=>{this.removeLoadedVehicle(e)})))}goToVeh(e,[t]){const i=Number(t);if(this.loadedVehiclesDBIdsWithSpawnedIds.has(i)){const t=GetPlayerPed(e),r=this.loadedVehiclesDBIdsWithSpawnedIds.get(i),[s,o,n]=GetEntityCoords(r,!0);SetEntityCoords(t,s,o,n,!0,!1,!1,!1);for(let e=-1;e<=6;e++)if(!DoesEntityExist(GetPedInVehicleSeat(r,e))){TaskWarpPedIntoVehicle(t,r,e);break}}}getVeh(e,[t]){const i=Number(t);if(this.loadedVehiclesDBIdsWithSpawnedIds.has(i)){const t=GetPlayerPed(e),r=this.loadedVehiclesDBIdsWithSpawnedIds.get(i),[s,o,n]=GetEntityCoords(t,!0);SetEntityCoords(r,s,o,n+1,!0,!1,!1,!1)}}loadVehicle(e,t,i){if(e.posX&&e.posY&&e.posZ){const r=this.addToLoadedVehicles(e,i||CreateVehicle(e.modelHash,e.posX,e.posY,e.posZ,e.posH,!0,!0),t);i||(SetVehicleColours(r,e.primaryColor,e.secondaryColor),SetVehicleNumberPlateText(r,e.plate||"ARMOURY")),SetVehicleDoorsLocked(null!=i?i:r,e.locked?2:1);const s=global.exports.authentication.getPlayerInfo(t,"vehiclekeys");return global.exports.authentication.setPlayerInfo(t,"vehiclekeys",[...Array.isArray(s)?s:[],e.id].filter(((e,t,i)=>i.indexOf(e)===t))),r}return NaN}addToLoadedVehicles(e,t,i){return this.loadedVehicles.set(t,Object.assign(Object.assign({},e),{instanceId:t,ownerName:GetPlayerName(i),ownerInstance:i})),this.loadedVehiclesDBIdsWithSpawnedIds.set(e.id,t),t}removeLoadedVehiclesBoundToPlayer(e){Array.from(this.loadedVehicles.values()).filter((t=>t.ownerInstance===e)).map((e=>[e.instanceId,e.id])).forEach((([e,t])=>{this.loadedVehicles.has(e)&&(this.removeLoadedVehicle(e),this.loadedVehicles.delete(e)),this.loadedVehiclesDBIdsWithSpawnedIds.has(t)&&this.loadedVehiclesDBIdsWithSpawnedIds.delete(t)}))}toggleLockOfThisVehicle(e,t,i=!0){if(SetVehicleDoorsLocked(e,2!==GetVehicleDoorLockStatus(e)?2:1),TriggerClientEvent("vehicles:vehicle-should-bleep-lights",t,NetworkGetNetworkIdFromEntity(e)),!i){const t=this.entities.find((t=>{var i;return t.id===(null===(i=this.loadedVehicles.get(e))||void 0===i?void 0:i.id)}));t&&(t.locked=!t.locked,this.saveDBEntityAsync(t.id))}}removeLoadedVehicle(e){DoesEntityExist(e)?(DeleteEntity(e),this.loadedVehicles.has(e)&&(this.loadedVehiclesDBIdsWithSpawnedIds.has(this.loadedVehicles.get(e).id)&&this.loadedVehiclesDBIdsWithSpawnedIds.delete(this.loadedVehicles.get(e).id),this.loadedVehicles.delete(e))):console.log("attempted to destroy entity",e,", but it doesn't exist.")}};f([a()],b.prototype,"createVehicle",null),f([a()],b.prototype,"getVehicleItems",null),f([a()],b.prototype,"updateVehicleItems",null),f([a()],b.prototype,"getVehiclesHashesFromArray",null),f([a()],b.prototype,"getVehicleHashKeyFromVehicleDbId",null),f([n({eventName:`${GetCurrentResourceName()}:unlock-this-vehicle`})],b.prototype,"onVehicleShouldUnlockForPlayer",null),f([n()],b.prototype,"onPlayerEnterVehicle",null),f([n()],b.prototype,"onPlayerExitVehicle",null),f([n()],b.prototype,"onPlayerAuthenticate",null),f([n()],b.prototype,"onResourceStop",null),f([l(2)],b.prototype,"goToVeh",null),f([l(3)],b.prototype,"getVeh",null),b=f([o()],b),new b("vehicles")})();