(()=>{"use strict";var e,t;!function(e){e[e.CARGO=0]="CARGO",e[e.ELECTRICITY=1]="ELECTRICITY",e[e.OIL=2]="OIL"}(e||(e={})),function(e){e[e.MAIN=0]="MAIN",e[e.LEGAL=1]="LEGAL",e[e.ILLEGAL=2]="ILLEGAL"}(t||(t={}));const s=(e,t,s,r,o,i,n)=>e>=r-n&&e<=r+n&&t>=o-n&&t<=o+n&&s>=i-n&&s<=i+n,r=(new Map([[e.OIL,[-1207431159,-730904777,1956216962]],[e.ELECTRICITY,[-2140210194]],[e.CARGO,[-1770643266,-877478386]]]),[{pos:[1367.4593505859375,-1867.7406005859375,55.172119140625],type:e.OIL},{pos:[1398.2901611328125,-2062.23291015625,50.5216064453125],type:e.OIL},{pos:[2678.835205078125,1602.778076171875,23.03955078125],type:e.OIL},{pos:[2815.7802734375,1561.4505615234375,23.10693359375],type:e.ELECTRICITY},{pos:[2046.909912109375,3183.61328125,43.5626220703125],type:e.CARGO},{pos:[1567.79345703125,3791.630859375,32.8125],type:e.CARGO},{pos:[346.8791198730469,3418.773681640625,34.952392578125],type:e.ELECTRICITY},{pos:[258.0659484863281,2849.630859375,42.13037109375],type:e.ELECTRICITY},{pos:[592.5758056640625,2733.454833984375,40.6138916015625],type:e.CARGO}]),o={OIL:10,ELECTRICITY:15,"CARGO 1":12,"CARGO 2":15,"CARGO 3":24,"CARGO 4":28};new class extends class extends class extends class{constructor(){this.routingBucketCondition=(e,t)=>!0,this.assignServerBaseListeners()}RegisterAdminCommand(e,t,s,r){RegisterCommand(e,((e,r,o)=>{Number(global.exports.authentication.getPlayerInfo(e,"adminLevel"))<t||s(e,r,o)}),r)}assignServerBaseListeners(){onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`,((e,t)=>{this.routingBucketCondition(e,t)&&SetEntityRoutingBucket(e,t)}))}}{removeClientsideVehicles(){TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`,-1)}}{}{constructor(){super(),this.truckers=new Map,this.savedPositions=new Map,this.assignEvents()}assignEvents(){onNet(`${GetCurrentResourceName()}:quick-start`,(t=>{const o=GetEntityCoords(GetPlayerPed(source),!0);let i;if(Array.from(this.savedPositions.keys()).forEach((r=>{e[t]===this.savedPositions.get(r).type&&s(o[0],o[1],o[2],r[0],r[1],r[2],15)&&(i=this.savedPositions.get(r).pos)})),!i){const n=r.filter((e=>!s(o[0],o[1],o[2],e.pos[0],e.pos[1],e.pos[2],30)&&e.type===this.decideDeliveryType(t)));i=n[Math.floor(Math.random()*n.length)].pos,this.savedPositions.set(o,{pos:i,type:e[t]})}var n,c,a,u;this.truckers.set(source,{distance:(n=[o[0],o[1],o[2],i[0],i[1],i[2]],c=n[3]-n[0],a=n[4]-n[1],u=n[5]-n[2],Math.hypot(c,a,u)),type:t}),console.log(this.truckers.get(source)),TriggerClientEvent("trucker-job:begin-job",source,{X:i[0],Y:i[1],Z:i[2]},t),setTimeout((()=>{this.savedPositions.delete(o)}),1e4)})),onNet(`${GetCurrentResourceName()}:get-job`,(()=>{global.exports.authentication.setPlayerInfo(source,"job","trucker",!1),TriggerClientEvent("trucker-job:job-assigned",source)})),onNet(`${GetCurrentResourceName()}:job-finished`,(()=>{const e=GetEntityCoords(GetPlayerPed(source),!0);r.forEach((t=>{if(s(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],15))return exports.authentication.setPlayerInfo(source,"cash",Number(exports.authentication.getPlayerInfo(source,"cash"))+(this.truckers.get(source).distance*o[this.truckers.get(source).type]+Math.floor(Math.random()*o[this.truckers.get(source).type]*20)),!1),TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`,source),global.exports.skills.incrementPlayerSkill(source,"trucker",.05),void(this.truckers.has(source)&&this.truckers.delete(source))}))}))}decideDeliveryType(e){switch(e){case"OIL":return 0;case"ELECTRICITY":return 1;default:return 2}}}})();