(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}();const t=e=>new Promise((t=>setTimeout(t,e))),i=(e,t,i,s,n,r,o)=>e>=s-o&&e<=s+o&&t>=n-o&&t<=n+o&&i>=r-o&&i<=r+o,s={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]};var n=function(e,t,i,s){return new(i||(i=Promise))((function(n,r){function o(e){try{a(s.next(e))}catch(e){r(e)}}function c(e){try{a(s.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((s=s.apply(e,t||[])).next())}))};new class extends class extends class extends class extends class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,s=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((i=void 0)||(i=Promise))((function(n,r){function o(e){try{a(s.next(e))}catch(e){r(e)}}function c(e){try{a(s.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((s=s.apply(e,t||[])).next())}));var e,t,i,s})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!e.longRange),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,i,n,r){const o=GetCurrentResourceName().replace("-"," "),c=`${o.slice(0,1).toUpperCase()}${o.slice(1)}`,a=this.createBlip({id:n||1,color:i||69,title:t||c,pos:e,longRange:!0});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,s[i][0],s[i][1],s[i][2],255,0),SetBlipRoute(a,!0),r&&SetBlipRouteColour(a,r),this._waypoints.push(a),a}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,i,s,n,r,o,c,a,l,h,u,d){const p=CreateCheckpoint(e,t,i,s,n,r,o,c,a,l,h,u,d);return this._checkpoints.set(p,[t,i,s,n,r,o]),p}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>Math.floor(this._checkpoints.get(t)[0])===Math.floor(e[0])&&Math.floor(this._checkpoints.get(t)[1])===Math.floor(e[1])&&Math.floor(this._checkpoints.get(t)[2])===Math.floor(e[2])));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>n(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((s=>n(this,void 0,void 0,(function*(){var n,r,o;if(i(e[0],e[1],e[2],s.pos[0],s.pos[1],s.pos[2],s.renderDistance)){if(s.textureDict&&!HasStreamedTextureDictLoaded(s.textureDict))for(RequestStreamedTextureDict(s.textureDict,!0);!HasStreamedTextureDictLoaded(s.textureDict);)yield t(100);DrawMarker(s.marker,s.pos[0],s.pos[1],s.pos[2],0,0,0,(null===(n=s.rotation)||void 0===n?void 0:n[0])||0,(null===(r=s.rotation)||void 0===r?void 0:r[1])||0,(null===(o=s.rotation)||void 0===o?void 0:o[2])||0,s.scale,s.scale,s.scale,s.rgba[0],s.rgba[1],s.rgba[2],s.rgba[3],!1,!0,2,!1,s.textureDict||null,s.textureName||null,!1),s.underlyingCircle&&DrawMarker(s.underlyingCircle.marker,s.pos[0],s.pos[1],s.pos[2]-.9,0,0,0,0,0,0,s.underlyingCircle.scale,s.underlyingCircle.scale,s.underlyingCircle.scale,s.underlyingCircle.rgba[0]||s.rgba[0],s.underlyingCircle.rgba[1]||s.rgba[1],s.underlyingCircle.rgba[2]||s.rgba[2],s.underlyingCircle.rgba[3]||s.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,i,s,r,o,c,a,l=!1){return n(this,void 0,void 0,(function*(){let n=0;for(RequestModel(e);!HasModelLoaded(e);){if(n>10)return 0;yield t(100),n++}const h=CreateVehicle(e,i,s,r,o,c,a);return h&&(a&&this._vehicles.push(h),l&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),h,-1)),h}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,i,s,r,o,c){return n(this,void 0,void 0,(function*(){let n=0;for(RequestModel(s);!HasModelLoaded(s);){if(n>10)return 0;yield t(100),n++}const a=CreatePedInsideVehicle(e,i,s,r,o,c);return a&&this._peds.push(a),a}))}createPedAsync(e,i,s,r,o,c,a,l){return n(this,void 0,void 0,(function*(){let n=0;for(RequestModel(i);!HasModelLoaded(i);){if(n>10)return 0;yield t(100),n++}const h=CreatePed(e,i,s,r,o,c,a,l);return h&&this._peds.push(h),h}))}setPedModelAsync(e,i){return n(this,void 0,void 0,(function*(){let s=0;for(RequestModel(i);!HasModelLoaded(i);){if(s>10)return!1;yield t(100),s++}SetPlayerModel(e,i),SetModelAsNoLongerNeeded(i)}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}}{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((s=>{i(e[0],e[1],e[2],s.pos[0],s.pos[1],s.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(s.action(),s.once&&t.push(s))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}{getPlayerInfo(t){let i=GetConvar(`${e.g.GetPlayerServerId(e.g.PlayerId())}_PI_${t}`,"-1");var s;return s=i.toString(),!/^\s*$/.test(s)&&(s=(s=(s=s.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(s))&&(i=JSON.parse(i.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),i}}{constructor(){super(),this.assignListeners()}assignListeners(){onNet(`${GetCurrentResourceName()}:apply-player-damage`,(e=>{SetEntityHealth(GetPlayerPed(-1),Math.floor(GetEntityHealth(GetPlayerPed(-1))-e))})),onNet("authentication:success",(()=>{SetEntityMaxHealth(GetPlayerPed(-1),200),SetEntityHealth(GetPlayerPed(-1),200)})),on("armoury:onPlayerDeath",(()=>{setTimeout((()=>{200===GetEntityMaxHealth(GetPlayerPed(-1))||IsEntityDead(GetPlayerPed(-1))||(SetEntityMaxHealth(GetPlayerPed(-1),200),SetEntityHealth(GetPlayerPed(-1),200))}),5e3)}))}}})();