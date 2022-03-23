(()=>{"use strict";const e=e=>!/^\s*$/.test(e)&&(e=(e=(e=e.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(e)),t={onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped"};var n;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(n||(n={}));const i=[],s=[];function o(e){return function(s,o,r){const a=t[o]||(null==e?void 0:e.eventName),l=(null==e?void 0:e.direction)||n.CLIENT_TO_SERVER;(null==a?void 0:a.length)?i.push([o,a,l]):console.error(`${o} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}var r=function(e,t,n,i){var s,o=arguments.length,r=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(o<3?s(r):o>3?s(t,n,r):s(t,n))||r);return o>3&&r&&Object.defineProperty(t,n,r),r},a=function(e,t,n,i){return new(n||(n=Promise))((function(s,o){function r(e){try{l(i.next(e))}catch(e){o(e)}}function a(e){try{l(i.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(r,a)}l((i=i.apply(e,t||[])).next())}))};class l extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,n,i){RegisterCommand(e,((e,i,s)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||n(e,i,s)}),i)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(e,t=!0){super(),this.dbTableName=e,this._entities=[],this._playerToEntityBindings=new Map,t&&this.loadDBEntities()}get entities(){return this._entities}get playerToEntityBindings(){return this._playerToEntityBindings}getEntities(){return this._entities}createEntity(e,t){return(()=>a(this,void 0,void 0,(function*(){try{let n=this.getEntityProperties(e),i=this.getEntityPropertiesValues(e,n);t&&(n=["id",...n],i=[t.toString(),...i]);const s=yield global.exports.oxmysql.insert_async(`INSERT INTO \`${this.dbTableName}\` (${n.join(", ")}) VALUES (${Array(n.length).fill("?").join(", ")})`,i);return this._entities.push(Object.assign(Object.assign({},e),{id:t||s})),this.syncWithClients(),t||s}catch(e){return console.log(e),null}})))()}removeEntity(e){return(()=>a(this,void 0,void 0,(function*(){try{const t=yield global.exports.oxmysql.query_async(`DELETE FROM \`${this.dbTableName}\` WHERE id = ?`,[e.id]);return this._entities=this._entities.filter((t=>t.id!==e.id)),this.syncWithClients(),!!t}catch(e){return console.log(e),!1}})))()}saveDBEntityAsync(e){return(()=>a(this,void 0,void 0,(function*(){try{const t=this.getEntityByDBId(e),n=this.getEntityProperties(t),i=this.getEntityPropertiesValues(t,n),s=" = ?, ",o=yield global.exports.oxmysql.update_async(`UPDATE \`${this.dbTableName}\` SET ${n.join(s).concat(s).slice(0,-2)} WHERE id = ?`,[...i,t.id]);return o&&this.syncWithClients(),o>0}catch(e){return console.log(e),!1}})))()}getEntityByDBId(e){return this._entities.find((t=>t.id===e))}loadDBEntityFor(t,n="id",i){return a(this,void 0,void 0,(function*(){const s=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\` WHERE ${n} = ?`,[t])).map((t=>(Object.keys(t).forEach((n=>{t[n]=JSON.parse(e(t[n].toString())?t[n]:`"${t[n]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),t)));return(null==s?void 0:s.length)?(this._entities.push(s[0]),i&&this.bindEntityToPlayerByEntityId(s[0].id,i),setTimeout((()=>{this.syncWithClients()}),2e3),s[0]):null}))}loadDBEntities(){setImmediate((()=>a(this,void 0,void 0,(function*(){const t=(yield global.exports.oxmysql.query_async(`SELECT * FROM \`${this.dbTableName}\``,[])).map((t=>(Object.keys(t).forEach((n=>{t[n]=JSON.parse(e(t[n].toString())?t[n]:`"${t[n]}"`,(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))})),t)));(null==t?void 0:t.length)&&(this._entities=t,setTimeout((()=>{this.syncWithClients()}),2e3))}))))}getEntityProperties(e){const t=[];for(let n in e)"id"!==n&&t.push(n);return t}getEntityPropertiesValues(e,t){return t.map((t=>Array.isArray(e[t])?JSON.stringify(e[t]):e[t].toString()))}syncWithClients(e){TriggerClientEvent(`${GetCurrentResourceName()}:db-send-entities`,e||-1,this.entities)}bindEntityToPlayer(e,t){this.entities.includes(e)&&this.bindEntityToPlayerByEntityId(e.id,t)}bindEntityToPlayerByEntityId(e,t){this._entities.some((t=>t.id===e))&&this._playerToEntityBindings.set(t,e)}onPlayerAuthenticate(e){this._entities.length&&this.syncWithClients(e)}onPlayerDisconnect(){if(this._playerToEntityBindings.has(source)){const e=this._entities.find((e=>e.id===this._playerToEntityBindings.get(source)));e&&this._entities.splice(this._entities.indexOf(e),1),this._playerToEntityBindings.delete(source)}}}r([function(e,t,n){s.push(t)}],l.prototype,"getEntities",null),r([o()],l.prototype,"onPlayerAuthenticate",null),r([o()],l.prototype,"onPlayerDisconnect",null);let c=class extends l{constructor(e){super(e,!1),this.phones=new Map,this.activeConversations=new Map,this.registerListeners(),this.fetchOnlinePlayersPhones()}registerListeners(){onNet(`${GetCurrentResourceName()}:add-contact`,(e=>{const t=this.entities.find((e=>e.id===Number(global.exports.authentication.getPlayerInfo(source,"phone"))));t&&(t.contacts.push(e),this.saveDBEntityAsync(t.id))})),onNet(`${GetCurrentResourceName()}:request-use-phone`,(()=>{const e=[...global.exports.factions.getOnlineFactionMembers("taxi").map((e=>({name:GetPlayerName(e.onlineId),phone:global.exports.authentication.getPlayerInfo(e.onlineId,"phone").toString(),service:"taxi"})))],t=Object.assign(Object.assign({},this.entities.find((e=>e.id===Number(global.exports.authentication.getPlayerInfo(source,"phone"))))),{serviceAgents:e});TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`,source,t)})),onNet(`${GetCurrentResourceName()}:request-service-call`,(e=>{e.phone?this.executeCall(source,Number(e.phone)):e.service})),onNet(`${GetCurrentResourceName()}:execute-call`,(e=>{this.executeCall(source,e)})),onNet(`${GetCurrentResourceName()}:answer-call`,(e=>{const t=Number(global.exports.authentication.getPlayerInfo(source,"phone"));this.answerCall(t,e)})),onNet(`${GetCurrentResourceName()}:refuse-call`,(e=>{const t=Number(global.exports.authentication.getPlayerInfo(source,"phone"));e||(e=Array.from(this.activeConversations.keys()).find((e=>this.activeConversations.get(e)===t))),e?this.refuseCall(t,e):this.activeConversations.has(t)&&this.hangUp(t,this.activeConversations.get(t))})),onNet("authentication:player-authenticated",((e,t)=>{let n=!isNaN(t.phone)&&t.phone>0?t.phone:0;n?this.loadDBEntityFor(n,"id",e):(n=1e6+t.id,global.exports.authentication.setPlayerInfo(e,"phone",n,!1),this.createEntity({id:n,contacts:[]},n)),this.phones.set(n,e)})),onNet("playerDropped",(()=>{const e=Array.from(this.phones.keys()).find((e=>this.phones[e]===source));e&&this.phones.delete(e)}))}executeCall(e,t){const n=this.phones.get(t),i=Number(global.exports.authentication.getPlayerInfo(e,"phone"));if(n){const e=Number(global.exports.authentication.getPlayerInfo(n,"phone"));this.activeConversations.set(i,e),this.notifyPlayerIsBeingCalled(n,i)}}notifyPlayerIsBeingCalled(e,t){const n=Number(global.exports.authentication.getPlayerInfo(e,"phone")),i=Object.assign(Object.assign({},this.entities.find((e=>e.id===n))),{myNumber:n,isBeingCalledBy:t});TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`,e,i)}answerCall(e,t){if(!this.activeConversations.has(t)||this.activeConversations.get(t)!==e)return void this.activeConversations.delete(t);const n=this.phones.get(e),i=this.phones.get(t);global.exports["pma-voice"].setPlayerCall(i,i),global.exports["pma-voice"].setPlayerCall(n,i),TriggerClientEvent(`${GetCurrentResourceName()}:called-picked-up`,i)}refuseCall(e,t){this.endCall(t);const n=this.phones.get(t);TriggerClientEvent(`${GetCurrentResourceName()}:call-ended`,n)}hangUp(e,t){this.endCall(e);const n=this.phones.get(t);TriggerClientEvent(`${GetCurrentResourceName()}:call-ended`,n)}fetchOnlinePlayersPhones(){global.exports.authentication.getAuthenticatedPlayers().forEach((e=>{this.phones.set(Number(global.exports.authentication.getPlayerInfo(e,"phone")),e)}))}endCall(e){if(this.activeConversations.has(e)){const t=this.phones.get(e),n=this.phones.get(this.activeConversations.get(e));global.exports["pma-voice"].setPlayerCall(n,0),global.exports["pma-voice"].setPlayerCall(t,0),this.activeConversations.delete(e)}}};c=function(e,t,n,i){var s,o=arguments.length,r=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,n):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,n,i);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(o<3?s(r):o>3?s(t,n,r):s(t,n))||r);return o>3&&r&&Object.defineProperty(t,n,r),r}([function(e){return class extends e{constructor(...e){super(...e),i.forEach((([e,t,i])=>{i===n.CLIENT_TO_CLIENT?on(t,super[e].bind(this)):onNet(t,super[e].bind(this))})),s.forEach((e=>{exports(e,super[e].bind(this))}))}}}],c),new c("phone_contacts")})();