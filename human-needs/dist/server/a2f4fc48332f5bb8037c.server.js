(()=>{"use strict";var e,t;(t=e||(e={}))[t.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",t[t.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",t[t.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",t[t.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT";const r=new Map,s=new Map,a={apple:{hungerGain:10},chocolate:{hungerGain:15},donut:{hungerGain:20},sandwich:{hungerGain:30},water:{thirstGain:50},coke:{thirstGain:30},red_bull:{thirstGain:30},cold_coffee:{thirstGain:30,hungerGain:5},beer_can:{thirstGain:20,drunknessGain:25},rum:{thirstGain:5,drunknessGain:50},whiskey:{thirstGain:5,drunknessGain:50},champagne:{thirstGain:10,drunknessGain:20}};let i=class extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,r,s){RegisterCommand(e,((e,s,a)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||r(e,s,a)}),s)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(){super(),this.hungerMap=new Map,this.thirstMap=new Map,this.intervals=[],setTimeout((()=>this.loadNeedsMaps()),1e3),this.assignListeners(),this.assignIntervals(),this.assignExports()}getPlayerHungerLevel(e){return this.hungerMap.has(e)?this.hungerMap.get(e):100}getPlayerThirstLevel(e){return this.thirstMap.has(e)?this.thirstMap.get(e):100}setPlayerHungerLevel(e,t){this.hungerMap.has(e)&&(this.hungerMap.set(e,Math.min(t,100)),global.exports["armoury-overlay"].updateItem(e,{id:"hunger",icon:"lunch_dining",value:`${Math.min(t,100)}%`}))}setPlayerThirstLevel(e,t){this.thirstMap.has(e)&&(this.thirstMap.set(e,Math.min(t,100)),global.exports["armoury-overlay"].updateItem(e,{id:"thirst",icon:"water_drop",value:`${Math.min(t,100)}%`}))}assignListeners(){onNet("authentication:player-authenticated",((e,t)=>{this.loadPlayerIntoNeedsMaps(e,t.hunger,t.thirst)})),onNet("inventory:inventory-item-clicked",(e=>{a[e.item.image]&&(a[e.item.image].hungerGain&&(this.setPlayerHungerLevel(source,this.getPlayerHungerLevel(source)+Number(a[e.item.image].hungerGain)),this.updateHungerThirstMessage(source)),a[e.item.image].healthGain,a[e.item.image].thirstGain&&(this.setPlayerThirstLevel(source,this.getPlayerThirstLevel(source)+Number(a[e.item.image].thirstGain)),this.updateHungerThirstMessage(source)),global.exports.inventory.consumePlayerItem(source,e.item,1))})),onNet("playerDropped",(()=>{this.hungerMap.has(source)&&this.hungerMap.delete(source),this.thirstMap.has(source)&&this.thirstMap.delete(source)})),onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this.clearIntervals(),Array.from(this.hungerMap.keys()).forEach((e=>{global.exports.authentication.setPlayerInfo(e,"hunger",global.exports.authentication.getPlayerInfo(e,"hunger"))})),Array.from(this.thirstMap.keys()).forEach((e=>{global.exports.authentication.setPlayerInfo(e,"thirst",global.exports.authentication.getPlayerInfo(e,"thirst"))})))}))}assignIntervals(){this.intervals.push(setInterval(this.onHungerDecrement.bind(this),Math.floor(3e4)),setInterval(this.onThirstDecrement.bind(this),Math.floor(24e3)))}clearIntervals(){this.intervals.forEach((e=>{clearInterval(e)}))}onHungerDecrement(){Array.from(this.hungerMap.keys()).forEach((e=>{this.decrementHungerForPlayer(e)}))}onThirstDecrement(){Array.from(this.thirstMap.keys()).forEach((e=>{this.decrementThirstForPlayer(e)}))}decrementHungerForPlayer(e){const t=this.hungerMap.get(e);this.hungerMap.set(e,Math.max(t-1,0)),this.updateHungerThirstMessage(e),0===t&&TriggerClientEvent(`${GetCurrentResourceName()}:apply-player-damage`,e,5),global.exports["armoury-overlay"].updateItem(e,{id:"hunger",icon:"lunch_dining",value:`${Math.floor(t)}%`})}decrementThirstForPlayer(e){const t=this.thirstMap.get(e);this.thirstMap.set(e,Math.max(t-1,0)),this.updateHungerThirstMessage(e),0===t&&TriggerClientEvent(`${GetCurrentResourceName()}:apply-player-damage`,e,2.5),global.exports["armoury-overlay"].updateItem(e,{id:"thirst",icon:"water_drop",value:`${Math.floor(t)}%`})}loadNeedsMaps(){global.exports.authentication.getAuthenticatedPlayers().forEach((e=>{this.loadPlayerIntoNeedsMaps(e,global.exports.authentication.getPlayerInfo(e,"hunger"),global.exports.authentication.getPlayerInfo(e,"thirst"))}))}loadPlayerIntoNeedsMaps(e,t,r){this.hungerMap.set(e,null==t?100:t),this.thirstMap.set(e,null==r?100:r),this.decrementThirstForPlayer(e),this.decrementHungerForPlayer(e)}updateHungerThirstMessage(e){this.getPlayerHungerLevel(e)<20||this.getPlayerThirstLevel(e)<20?global.exports["armoury-overlay"].setMessage(e,{id:"needs-message",content:`You are ${this.getPlayerHungerLevel(e)<20?this.getPlayerThirstLevel(e)<20?"hungry and thirsty":"hungry":this.getPlayerThirstLevel(e)<20?"thirsty":""}. Buy ${this.getPlayerHungerLevel(e)<20?this.getPlayerThirstLevel(e)<20?"drinks/food":" food":this.getPlayerThirstLevel(e)<20?"drinks":""} at any 24/7 shop.`}):global.exports["armoury-overlay"].deleteMessage(e,{id:"needs-message"})}assignExports(){exports("getPlayerHungerLevel",this.getPlayerHungerLevel.bind(this)),exports("getPlayerThirstLevel",this.getPlayerThirstLevel.bind(this)),exports("setPlayerHungerLevel",this.setPlayerHungerLevel.bind(this)),exports("setPlayerThirstLevel",this.setPlayerThirstLevel.bind(this))}};i=function(e,t,r,s){var a,i=arguments.length,n=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,r):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,r,s);else for(var h=e.length-1;h>=0;h--)(a=e[h])&&(n=(i<3?a(n):i>3?a(t,r,n):a(t,r))||n);return i>3&&n&&Object.defineProperty(t,r,n),n}([function(t){return class extends t{constructor(...a){super(...a),r.has(t)&&r.get(t).forEach((([t,r,s])=>{s===e.CLIENT_TO_CLIENT?on(r,super[t].bind(this)):onNet(r,super[t].bind(this))})),s.has(t)&&s.get(t).forEach((e=>{exports(e,super[e].bind(this))}))}}}],i),new i})();