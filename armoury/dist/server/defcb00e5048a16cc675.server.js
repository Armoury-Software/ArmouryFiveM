(()=>{"use strict";var e={147:e=>{e.exports=require("fs")}},t={};function r(s){var o=t[s];if(void 0!==o)return o.exports;var i=t[s]={exports:{}};return e[s](i,i.exports,r),i.exports}(()=>{const e={trucker:{pos:[124.60220336914062,-2682.474609375,10.229248046875]},carrier:{pos:[-439.8214,-2786.469,6.000384]},garbageman:{pos:[-267.5868225097656,197.41978454589844,89.22119140625]}},t=r(147);new class extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,r,s){RegisterCommand(e,((e,s,o)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||r(e,s,o)}),s)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(){super(),this._players=[],this.registerCommands(),this.registerFiveMEventListeners(),this.registerListeners(),this.registerExports(),this._players=[];for(let e=0;e<1024;e++)NetworkIsPlayerActive(e)&&this._players.push(e)}registerCommands(){RegisterCommand("pos",((e,r)=>{let s=[],o=[];0!==GetVehiclePedIsIn(GetPlayerPed(e),!0)?(s=GetEntityCoords(GetVehiclePedIsIn(GetPlayerPed(e),!1),!0),o=GetEntityRotation(GetVehiclePedIsIn(GetPlayerPed(e),!1),2)):(s=GetEntityCoords(GetPlayerPed(e),!0),o=GetEntityRotation(GetPlayerPed(e),2));const i=`${s.map((e=>Number(e.toString()).toFixed(4))).join(",")},${o.map((e=>Number(e.toString()))).join(",")}`;console.log(`Source position is ${i}`),t.appendFile("savedpositions.txt",`\n${i} ${r.slice().shift()}`,(()=>{}))}),!1),RegisterCommand("tp",((t,r)=>{r.length?e[r[0]]?SetEntityCoords(GetPlayerPed(t),e[r[0]].pos[0],e[r[0]].pos[1],e[r[0]].pos[2],!0,!1,!1,!1):console.log(`No teleport with name ${r[0]}`):console.log("Error! Use /tp <location>.")}),!1)}registerListeners(){onNet(`${GetCurrentResourceName()}:open-general-menu`,(()=>{global.exports["armoury-overlay"].showContextMenu(source,{title:"General Menu",id:"general-menu",items:[{label:"GPS",active:!0},{label:"Legitimation"}]})})),onNet(`${GetCurrentResourceName()}:open-admin-menu`,(e=>{global.exports["armoury-overlay"].showContextMenu(source,e)}))}registerFiveMEventListeners(){onNet("playerJoining",((e,t)=>{this._players.push(source)})),onNet("playerDropped",(e=>{this._players=this._players.filter((e=>e!==source))}))}getPlayers(){return this._players}registerExports(){exports("getPlayers",this.getPlayers.bind(this))}}})()})();