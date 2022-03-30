(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}();const t=e=>new Promise((t=>setTimeout(t,e))),i=(e,t,i,n,s,o,r)=>e>=n-r&&e<=n+r&&t>=s-r&&t<=s+r&&i>=o-r&&i<=o+r,n={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]};var s,o,r=function(e,t,i,n){return new(i||(i=Promise))((function(s,o){function r(e){try{c(n.next(e))}catch(e){o(e)}}function a(e){try{c(n.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(r,a)}c((n=n.apply(e,t||[])).next())}))};(o=s||(s={}))[o.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",o[o.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",o[o.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",o[o.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT";const a=new Map,c=new Map;let l=class extends class extends class extends class extends class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,n=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((i=void 0)||(i=Promise))((function(s,o){function r(e){try{c(n.next(e))}catch(e){o(e)}}function a(e){try{c(n.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(r,a)}c((n=n.apply(e,t||[])).next())}));var e,t,i,n})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!e.longRange),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,i,s,o){const r=GetCurrentResourceName().replace("-"," "),a=`${r.slice(0,1).toUpperCase()}${r.slice(1)}`,c=this.createBlip({id:s||1,color:i||69,title:t||a,pos:e,longRange:!0});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,n[i][0],n[i][1],n[i][2],255,0),SetBlipRoute(c,!0),o&&SetBlipRouteColour(c,o),this._waypoints.push(c),c}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,i,n,s,o,r,a,c,l,h,u,d){const p=CreateCheckpoint(e,t,i,n,s,o,r,a,c,l,h,u,d);return this._checkpoints.set(p,[t,i,n,s,o,r]),p}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>Math.floor(this._checkpoints.get(t)[0])===Math.floor(e[0])&&Math.floor(this._checkpoints.get(t)[1])===Math.floor(e[1])&&Math.floor(this._checkpoints.get(t)[2])===Math.floor(e[2])));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>r(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((n=>r(this,void 0,void 0,(function*(){var s,o,r;if(i(e[0],e[1],e[2],n.pos[0],n.pos[1],n.pos[2],n.renderDistance)){if(n.textureDict&&!HasStreamedTextureDictLoaded(n.textureDict))for(RequestStreamedTextureDict(n.textureDict,!0);!HasStreamedTextureDictLoaded(n.textureDict);)yield t(100);DrawMarker(n.marker,n.pos[0],n.pos[1],n.pos[2],0,0,0,(null===(s=n.rotation)||void 0===s?void 0:s[0])||0,(null===(o=n.rotation)||void 0===o?void 0:o[1])||0,(null===(r=n.rotation)||void 0===r?void 0:r[2])||0,n.scale,n.scale,n.scale,n.rgba[0],n.rgba[1],n.rgba[2],n.rgba[3],!1,!0,2,!1,n.textureDict||null,n.textureName||null,!1),n.underlyingCircle&&DrawMarker(n.underlyingCircle.marker,n.pos[0],n.pos[1],n.pos[2]-.9,0,0,0,0,0,0,n.underlyingCircle.scale,n.underlyingCircle.scale,n.underlyingCircle.scale,n.underlyingCircle.rgba[0]||n.rgba[0],n.underlyingCircle.rgba[1]||n.rgba[1],n.underlyingCircle.rgba[2]||n.rgba[2],n.underlyingCircle.rgba[3]||n.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,i,n,s,o,a,c,l=!1){return r(this,void 0,void 0,(function*(){let r=0;for(RequestModel(e);!HasModelLoaded(e);){if(r>10)return 0;yield t(100),r++}const h=CreateVehicle(e,i,n,s,o,a,c);return h&&(c&&this._vehicles.push(h),l&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),h,-1)),h}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,i,n,s,o,a){return r(this,void 0,void 0,(function*(){let r=0;for(RequestModel(n);!HasModelLoaded(n);){if(r>10)return 0;yield t(100),r++}const c=CreatePedInsideVehicle(e,i,n,s,o,a);return c&&this._peds.push(c),c}))}createPedAsync(e,i,n,s,o,a,c,l){return r(this,void 0,void 0,(function*(){let r=0;for(RequestModel(i);!HasModelLoaded(i);){if(r>10)return 0;yield t(100),r++}const h=CreatePed(e,i,n,s,o,a,c,l);return h&&this._peds.push(h),h}))}setPedModelAsync(e,i){return r(this,void 0,void 0,(function*(){let n=0;for(RequestModel(i);!HasModelLoaded(i);){if(n>10)return!1;yield t(100),n++}SetPlayerModel(e,i),SetModelAsNoLongerNeeded(i)}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}}{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((n=>{i(e[0],e[1],e[2],n.pos[0],n.pos[1],n.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(n.action(),n.once&&t.push(n))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}{getPlayerInfo(t){let i=GetConvar(`${e.g.GetPlayerServerId(e.g.PlayerId())}_PI_${t}`,"-1");var n;return n=i.toString(),!/^\s*$/.test(n)&&(n=(n=(n=n.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(n))&&(i=JSON.parse(i.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),i}}{constructor(){super(),this.isPlayingAnim=!1,this.assignListeners()}assignListeners(){onNet(`${GetCurrentResourceName()}:apply-player-damage`,(e=>{SetEntityHealth(GetPlayerPed(-1),Math.floor(GetEntityHealth(GetPlayerPed(-1))-e))})),onNet(`${GetCurrentResourceName()}:play-animation`,(e=>{if(!this.isPlayingAnim&&!IsPedInAnyVehicle(GetPlayerPed(-1),!0)){let t=CreateObject(e.animationOptions.prop,0,0,0,!0,!1,!1);RequestAnimDict(e.animationDict),AttachEntityToEntity(t,GetPlayerPed(-1),GetPedBoneIndex(GetPlayerPed(-1),e.animationOptions.propBone),e.animationOptions.propPlacement[0],e.animationOptions.propPlacement[1],e.animationOptions.propPlacement[2],e.animationOptions.propPlacement[3],e.animationOptions.propPlacement[4],e.animationOptions.propPlacement[5],!1,!0,!0,!0,GetEntityRotation(GetPlayerPed(-1))[0],!0),TaskPlayAnim(GetPlayerPed(-1),e.animationDict,e.animationName,2,2,5e3,0,0,!1,!1,!1),this.isPlayingAnim=!0,setTimeout((()=>{StopAnimTask(GetPlayerPed(-1),e.animationDict,e.animationName,2),this.isPlayingAnim=!1,DeleteEntity(t)}),e.duration)}})),onNet("authentication:success",(()=>{SetEntityMaxHealth(GetPlayerPed(-1),200),SetEntityHealth(GetPlayerPed(-1),200)})),on("armoury:onPlayerDeath",(()=>{setTimeout((()=>{200===GetEntityMaxHealth(GetPlayerPed(-1))||IsEntityDead(GetPlayerPed(-1))||(SetEntityMaxHealth(GetPlayerPed(-1),200),SetEntityHealth(GetPlayerPed(-1),200))}),5e3)}))}};l=function(e,t,i,n){var s,o=arguments.length,r=o<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(r=(o<3?s(r):o>3?s(t,i,r):s(t,i))||r);return o>3&&r&&Object.defineProperty(t,i,r),r}([function(e){return class extends e{constructor(...t){super(...t),a.has(e)&&a.get(e).forEach((([e,t,i])=>{i===s.CLIENT_TO_CLIENT?on(t,super[e].bind(this)):onNet(t,super[e].bind(this))})),c.has(e)&&c.get(e).forEach((e=>{exports(e,super[e].bind(this))}))}}}],l),new l})();