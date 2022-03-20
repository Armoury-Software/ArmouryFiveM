(()=>{"use strict";const e=(e,s,t,r,o,i,a)=>e>=r-a&&e<=r+a&&s>=o-a&&s<=o+a&&t>=i-a&&t<=i+a,s=[-522.5355,-2866.82,4.00038];new class extends class extends class extends class{constructor(){this.routingBucketCondition=(e,s)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,s,t,r){RegisterCommand(e,((e,r,o)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<s||t(e,r,o)}),r)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,s)=>{this.routingBucketCondition(e,s)&&SetEntityRoutingBucket(e,s)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(){super(),this.carriers=new Map,this.savedPositions=new Map,this.assignEvents()}beginRouteForPlayer(s,t){const r=GetEntityCoords(GetPlayerPed(s),!0);let o;if(Array.from(this.savedPositions.keys()).forEach((s=>{e(r[0],r[1],r[2],s[0],s[1],s[2],15)&&(o=this.savedPositions.get(s).pos)})),!o){const e=this.getPossibleDeliveryPoints(r,15);o=e[Math.floor(Math.random()*e.length)].pos,this.savedPositions.set(r,{pos:o})}var i,a,c,n;this.carriers.set(source,{distance:(i=[r[0],r[1],r[2],o[0],o[1],o[2]],a=i[3]-i[0],c=i[4]-i[1],n=i[5]-i[2],Math.hypot(a,c,n)),packages:this.carriers.get(source).packages}),this.updatePackageUI(),TriggerClientEvent(`${GetCurrentResourceName()}:begin-route`,source,{X:o[0],Y:o[1],Z:o[2]-1},t),setTimeout((()=>{this.savedPositions.delete(r)}),1e4)}updatePackageUI(e=!0){this.carriers.has(source)&&(e?global.exports["armoury-overlay"].setMessage(source,{id:"carrier-packages",content:0===this.carriers.get(source).packages?"You have no packages left. Pick some up from the docks.":`You have ${this.carriers.get(source).packages}/15 packages left.`}):global.exports["armoury-overlay"].deleteMessage(source,{id:"carrier-packages"}))}getPossibleDeliveryPoints(s,t){const r=global.exports.businesses.getEntities().map((e=>({pos:[e.depositX,e.depositY,e.depositZ]})));return s&&t?r.filter((r=>!e(s[0],s[1],s[2],r.pos[0],r.pos[1],r.pos[2],t))):r}assignEvents(){onNet(`${GetCurrentResourceName()}:playerDropped`,(()=>{this.carriers.has(source)&&this.carriers.delete(source)})),onNet("baseevents:leftVehicle",(()=>{this.updatePackageUI(!1)})),onNet("baseevents:enteredVehicle",(()=>{GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source),!1))===GetHashKey("Mule")&&this.updatePackageUI()})),onNet(`${GetCurrentResourceName()}:quick-start`,((e=!1)=>{this.carriers.set(source,{distance:0,packages:15}),this.beginRouteForPlayer(source,!e)})),onNet(`${GetCurrentResourceName()}:get-job`,(()=>{global.exports.authentication.setPlayerInfo(source,"job","carrier",!1),TriggerClientEvent("carrier-job:job-assigned",source)})),onNet(`${GetCurrentResourceName()}:route-finished`,(()=>{const s=GetEntityCoords(GetPlayerPed(source),!0);this.getPossibleDeliveryPoints().forEach((t=>{if(e(s[0],s[1],s[2],t.pos[0],t.pos[1],t.pos[2],10)&&GetEntityModel(GetVehiclePedIsIn(GetPlayerPed(source),!1))===GetHashKey("Mule"))return exports.authentication.setPlayerInfo(source,"cash",Number(exports.authentication.getPlayerInfo(source,"cash"))+(22*this.carriers.get(source).distance+Math.floor(100*Math.random())),!1),global.exports.skills.incrementPlayerSkill(source,"carrier",.01),console.log(this.carriers.get(source)),this.carriers.set(source,{distance:0,packages:this.carriers.get(source).packages-1}),void(0===this.carriers.get(source).packages?this.triggerPickup(source):this.beginRouteForPlayer(source,!1))}))}))}triggerPickup(e){this.updatePackageUI(),TriggerClientEvent(`${GetCurrentResourceName()}:pickup-route`,e,{X:s[0],Y:s[1],Z:s[2]})}}})();