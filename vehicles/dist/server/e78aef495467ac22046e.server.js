(()=>{"use strict";const e={onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped",onResourceStop:"onResourceStop"};var t;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(t||(t={}));const i=new Map,n=new Map;function s(n){return function(s,o,r){const l=e[o]||(null==n?void 0:n.eventName),a=(null==n?void 0:n.direction)||t.CLIENT_TO_SERVER;(null==l?void 0:l.length)?(i.has(s.constructor)||i.set(s.constructor,[]),i.get(s.constructor).some((([e,t,i])=>e===o))||i.get(s.constructor).push([o,l,a])):console.error(`${o} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}const o=e=>!/^\s*$/.test(e)&&(e=(e=(e=e.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(e));var r=function(e,t,i,n){var s,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(o<3?s(r):o>3?s(t,i,r):s(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r},l=function(e,t,i,n){return new(i||(i=Promise))((function(s,o){function r(e){try{a(n.next(e))}catch(e){o(e)}}function l(e){try{a(n.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(r,l)}a((n=n.apply(e,t||[])).next())}))};class a extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,i,n){RegisterCommand(e,((e,n,s)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||i(e,n,s)}),n)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(e,t=!1){super(),this.dbTableName=e,this._entities=[],this._playerToEntityBindings=new Map,t&&this.loadDBEntities()}get entities(){return this._entities}get playerToEntityBindings(){return this._playerToEntityBindings}getEntities(){return this._entities}createEntity(e,t){return(()=>l(this,void 0,void 0,(function*(){try{let i=this.getEntityProperties(e),n=this.getEntityPropertiesValues(e,i);t&&(i=["id",...i],n=[t.toString(),...n]);const s=yield global.exports.oxmysql.insert_async(`INSERT INTO \`${this.dbTableName}\` (${i.join(", ")}) VALUES (${Array(i.length).fill("?").join(", ")})`,n);return this._entities.push(Object.assign(Object.assign({},e),{id:t||s})),this.syncWithClients(),t||s}catch(e){return console.log(e),null}})))()}removeEntity(e){return(()=>l(this,void 0,void 0,(function*(){try{const t=yield global.exports.oxmysql.query_async(`DELETE FROM \`${this.dbTableName}\` WHERE id = ?`,[e.id]);return this._entities=this._entities.filter((t=>t.id!==e.id)),this.syncWithClients(),!!t}catch(e){return console.log(e),!1}})))()}saveDBEntityAsync(e){return(()=>l(this,void 0,void 0,(function*(){try{const t=this.getEntityByDBId(e),i=this.getEntityProperties(t),n=this.getEntityPropertiesValues(t,i),s=" = ?, ",o=yield global.exports.oxmysql.update_async(`UPDATE \`${this.dbTableName}\` SET ${i.join(s).concat(s).slice(0,-2)} WHERE id = ?`,[...n,t.id]);return o&&this.syncWithClients(),o>0}catch(e){return console.log(e),!1}})))()}getEntityByDBId(e){return this._entities.find((t=>t.id===e))}loadDBEntityFor(e,t="id",i){return l(this,void 0,void 0,(function*(){const n=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\` WHERE ${t} = ?`,[e])).map((e=>(Object.keys(e).forEach((t=>{e[t]=JSON.parse(o(e[t].toString())?e[t]:`"${e[t]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),e)));return(null==n?void 0:n.length)?(this._entities.forEach((e=>{this._entities.push(e),i&&this.bindEntityToPlayerByEntityId(e.id,i)})),setTimeout((()=>{this.syncWithClients()}),2e3),(null==n?void 0:n.length)>1?n:n[0]):null}))}loadDBEntities(){setImmediate((()=>l(this,void 0,void 0,(function*(){const e=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\``,[])).map((e=>(Object.keys(e).forEach((t=>{e[t]=JSON.parse(o(e[t].toString())?e[t]:`"${e[t]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),e)));(null==e?void 0:e.length)&&(this._entities=e,setTimeout((()=>{this.syncWithClients()}),2e3))}))))}getEntityProperties(e){const t=[];for(let i in e)"id"!==i&&t.push(i);return t}getEntityPropertiesValues(e,t){return t.map((t=>Array.isArray(e[t])?JSON.stringify(e[t]):e[t].toString()))}syncWithClients(e){TriggerClientEvent(`${GetCurrentResourceName()}:db-send-entities`,e||-1,this.entities)}bindEntityToPlayer(e,t){this.entities.includes(e)&&this.bindEntityToPlayerByEntityId(e.id,t)}bindEntityToPlayerByEntityId(e,t){this._entities.some((t=>t.id===e))&&(this._playerToEntityBindings.has(t)?this._playerToEntityBindings.set(t,[...this._playerToEntityBindings.get(t),e]):this._playerToEntityBindings.set(t,[e]))}onBoundEntityDestroyed(e,t){}onPlayerAuthenticate(e,t){this._entities.length&&this.syncWithClients(e)}onPlayerDisconnect(){this._playerToEntityBindings.has(source)&&((this._playerToEntityBindings.has(source)?this._playerToEntityBindings.get(source):[]).forEach((e=>{const t=this._entities.find((t=>t.id===e));t&&(this.onBoundEntityDestroyed(t,source),this._entities.splice(this._entities.indexOf(t),1))})),this._playerToEntityBindings.delete(source))}}r([function(e,t,i){n.has(e.constructor)||n.set(e.constructor,[]),n.get(e.constructor).some((e=>e===t))||n.get(e.constructor).push(t)}],a.prototype,"getEntities",null),r([s()],a.prototype,"onPlayerAuthenticate",null),r([s()],a.prototype,"onPlayerDisconnect",null);var c=function(e,t,i,n){var s,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(r=(o<3?s(r):o>3?s(t,i,r):s(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r};let d=class extends a{constructor(){super(...arguments),this.loadedVehicles=new Map}onBoundEntityDestroyed(e,t){this.removeLoadedVehiclesBoundToPlayer(t)}onPlayerAuthenticate(e,t){super.onPlayerAuthenticate(e,t),this.loadDBEntityFor(t.id,"owner",e).then((t=>{t&&(Array.isArray(t)?t.forEach((t=>{this.loadVehicle(t,e)})):this.loadVehicle(t,e),global.exports.authentication.setPlayerInfo(e,"vehiclekeys",(Array.isArray(t)?t:[t]).map((e=>e.id))))}))}onResourceStop(e){e===GetCurrentResourceName()&&(console.log("Resource stopped. Attempting to remove all loaded vehicles.."),Array.from(this.loadedVehicles.keys()).forEach((e=>{this.removeLoadedVehicle(e)})))}loadVehicle(e,t){if(e.posX&&e.posY&&e.posZ){const i=this.addToLoadedVehicles(e,CreateVehicle(e.modelHash,e.posX,e.posY,e.posZ,e.posH,!0,!0),t);SetVehicleColours(i,e.primaryColor,e.secondaryColor),SetVehicleNumberPlateText(i,e.plate||"ARMOURY")}return!1}addToLoadedVehicles(e,t,i){return this.loadedVehicles.set(t,Object.assign(Object.assign({},e),{instanceId:t,ownerName:GetPlayerName(i),ownerInstance:i})),t}removeLoadedVehiclesBoundToPlayer(e){Array.from(this.loadedVehicles.values()).filter((t=>t.ownerInstance===e)).map((e=>e.instanceId)).forEach((e=>{this.loadedVehicles.has(e)&&(console.log("found vehicle",e,", attempting to destroy it.."),this.removeLoadedVehicle(e),this.loadedVehicles.delete(e))}))}removeLoadedVehicle(e){DoesEntityExist(e)?DeleteEntity(e):console.log("attempted to destroy entity",e,", but it doesn't exist.")}};c([s()],d.prototype,"onPlayerAuthenticate",null),c([s()],d.prototype,"onResourceStop",null),d=c([function(e){return class extends e{constructor(...s){super(...s),i.has(e)&&i.get(e).forEach((([e,i,n])=>{n===t.CLIENT_TO_CLIENT?on(i,super[e].bind(this)):onNet(i,super[e].bind(this))})),n.has(e)&&n.get(e).forEach((e=>{exports(e,super[e].bind(this))}))}}}],d),new d("vehicles")})();