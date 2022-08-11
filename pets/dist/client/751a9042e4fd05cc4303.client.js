(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}();const t={onPlayerDeath:"armoury:onPlayerDeath",onPlayerAuthenticate:"authentication:player-authenticated",onPlayerDisconnect:"playerDropped",onResourceStop:"onResourceStop",onContextMenuItemPressed:"armoury-overlay:context-menu-item-pressed",onPlayerEnterVehicle:"armoury:onPlayerEnterVehicle",onPlayerExitVehicle:"armoury:onPlayerExitVehicle",onPlayerClientsidedCacheLoaded:"armoury:player-resource-cache-loaded"};var r;!function(e){e[e.SERVER_TO_SERVER=0]="SERVER_TO_SERVER",e[e.SERVER_TO_CLIENT=1]="SERVER_TO_CLIENT",e[e.CLIENT_TO_SERVER=2]="CLIENT_TO_SERVER",e[e.CLIENT_TO_CLIENT=3]="CLIENT_TO_CLIENT"}(r||(r={}));const i=new Map,n=new Map,o=new Map;function s(){return function(t){return class extends t{constructor(...s){super(...s),i.has(t)&&i.get(t).forEach((([e,t,i])=>{i===r.CLIENT_TO_CLIENT?on(t,super[e].bind(this)):onNet(t,super[e].bind(this))})),n.has(t)&&n.get(t).forEach((e=>{exports(e,super[e].bind(this))})),o.has(t)&&o.get(t).forEach((([t,r])=>{RegisterCommand(t.toLowerCase(),((i,n,o)=>{Number(e.g.exports.authentication.getPlayerInfo(i,"adminLevel"))<r||super[t].call(this,i,n,o)}),!1)}))}}}}function a(e){return function(n,o,s){const a=t[o]||(null==e?void 0:e.eventName),c=(null==e?void 0:e.direction)||r.CLIENT_TO_SERVER;(null==a?void 0:a.length)?(i.has(n.constructor)||i.set(n.constructor,[]),i.get(n.constructor).some((([e,t,r])=>e===o))||i.get(n.constructor).push([o,a,c])):console.error(`${o} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`)}}const c={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]},l=e=>new Promise((t=>setTimeout(t,e))),h=(e,t,r,i,n,o,s)=>e>=i-s&&e<=i+s&&t>=n-s&&t<=n+s&&r>=o-s&&r<=o+s;var u=function(e,t,r,i){var n,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(s=(o<3?n(s):o>3?n(t,r,s):n(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s},d=function(e,t,r,i){return new(r||(r=Promise))((function(n,o){function s(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(s,a)}c((i=i.apply(e,t||[])).next())}))};let p=class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,i=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((r=void 0)||(r=Promise))((function(n,o){function s(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(s,a)}c((i=i.apply(e,t||[])).next())}));var e,t,r,i})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}getPlayerInfo(t,r){let i=GetConvar(`${r||e.g.GetPlayerServerId(e.g.PlayerId())}_PI_${t}`,"-1");var n;return n=i.toString(),!/^\s*$/.test(n)&&(n=(n=(n=n.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(n))&&(i=JSON.parse(i.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),i}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!e.longRange),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,r,i,n){const o=GetCurrentResourceName().replace("-"," "),s=`${o.slice(0,1).toUpperCase()}${o.slice(1)}`,a=this.createBlip({id:i||1,color:r||69,title:t||s,pos:e,longRange:!0});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,c[r][0],c[r][1],c[r][2],255,0),SetBlipRoute(a,!0),n&&SetBlipRouteColour(a,n),this._waypoints.push(a),a}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,r,i,n,o,s,a,c,l,h,u,d){const p=CreateCheckpoint(e,t,r,i,n,o,s,a,c,l,h,u,d);return this._checkpoints.set(p,[t,r,i,n,o,s]),p}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>Math.floor(this._checkpoints.get(t)[0])===Math.floor(e[0])&&Math.floor(this._checkpoints.get(t)[1])===Math.floor(e[1])&&Math.floor(this._checkpoints.get(t)[2])===Math.floor(e[2])));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>d(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((t=>d(this,void 0,void 0,(function*(){var r,i,n;if(h(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],t.renderDistance)){if(t.textureDict&&!HasStreamedTextureDictLoaded(t.textureDict))for(RequestStreamedTextureDict(t.textureDict,!0);!HasStreamedTextureDictLoaded(t.textureDict);)yield l(100);DrawMarker(t.marker,t.pos[0],t.pos[1],t.pos[2],0,0,0,(null===(r=t.rotation)||void 0===r?void 0:r[0])||0,(null===(i=t.rotation)||void 0===i?void 0:i[1])||0,(null===(n=t.rotation)||void 0===n?void 0:n[2])||0,t.scale,t.scale,t.scale,t.rgba[0],t.rgba[1],t.rgba[2],t.rgba[3],!1,!0,2,!1,t.textureDict||null,t.textureName||null,!1),t.underlyingCircle&&DrawMarker(t.underlyingCircle.marker,t.pos[0],t.pos[1],t.pos[2]-.9,0,0,0,0,0,0,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.rgba[0]||t.rgba[0],t.underlyingCircle.rgba[1]||t.rgba[1],t.underlyingCircle.rgba[2]||t.rgba[2],t.underlyingCircle.rgba[3]||t.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,t,r,i,n,o,s,a=!1){return d(this,void 0,void 0,(function*(){let c=0;for(RequestModel(e);!HasModelLoaded(e);){if(c>10)return 0;yield l(100),c++}const h=CreateVehicle(e,t,r,i,n,o,s);return h&&(s&&this._vehicles.push(h),a&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),h,-1)),h}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,t,r,i,n,o){return d(this,void 0,void 0,(function*(){let s=0;for(RequestModel(r);!HasModelLoaded(r);){if(s>10)return 0;yield l(100),s++}const a=CreatePedInsideVehicle(e,t,r,i,n,o);return a&&this._peds.push(a),a}))}createPedAsync(e,t,r,i,n,o,s,a){return d(this,void 0,void 0,(function*(){let c=0;for(RequestModel(t);!HasModelLoaded(t);){if(c>10)return 0;yield l(100),c++}const h=CreatePed(e,t,r,i,n,o,s,a);return h&&this._peds.push(h),h}))}playAnimForPed(e,t,r,i,n=0,o=8,s=8){return d(this,void 0,void 0,(function*(){let a=0;for(RequestAnimDict(t);!HasAnimDictLoaded(t);){if(a>10)return;yield l(100),a++}HasAnimDictLoaded(t)&&TaskPlayAnim(e,t,r,o,s,i,n,0,!1,!1,!1)}))}setPedModelAsync(e,t){return d(this,void 0,void 0,(function*(){let r=0;for(RequestModel(t);!HasModelLoaded(t);){if(r>10)return!1;yield l(100),r++}SetPlayerModel(e,t),SetModelAsNoLongerNeeded(t)}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}onRefreshPlayersInVirtualWorld(){GetActivePlayers().forEach((e=>{const t=GetPlayerServerId(e);this.getPlayerInfo("virtualWorld")===this.getPlayerInfo("virtualWorld",t)?NetworkConcealPlayer(e,!1,!1):NetworkConcealPlayer(e,!0,!1)}))}};u([a({eventName:`${GetCurrentResourceName()}:refresh-virtual-world`})],p.prototype,"onRefreshPlayersInVirtualWorld",null),p=u([s()],p);class y extends p{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((r=>{h(e[0],e[1],e[2],r.pos[0],r.pos[1],r.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(r.action(),r.once&&t.push(r))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}class f extends y{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}class P extends f{}var m=function(e,t,r,i){var n,o=arguments.length,s=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(s=(o<3?n(s):o>3?n(t,r,s):n(t,r))||s);return o>3&&s&&Object.defineProperty(t,r,s),s};let k=class extends P{constructor(){super(...arguments),this._spawnedPetsInVirtualWorlds=[]}get spawnedPetsInVirtualWorlds(){return this._spawnedPetsInVirtualWorlds}onPetShouldBeCreated(e,t,r,i){this.createPedAsync(0,GetHashKey(e.pedId),t[0],t[1],t[2],t[3],!1,!1).then((e=>{this._spawnedPetsInVirtualWorlds.push(e),r?setTimeout((()=>{this.makePetGreetPlayer(!0),setTimeout((()=>{this.makePetFollowPlayer(!0)}),3e3)}),1e3):!isNaN(i)&&i>-1?(console.log("(client.controller.ts:) reached here! (1)"),console.log("(client.controller.ts:) pets received owner ped network id:",i),setTimeout((()=>{const t=NetworkGetEntityFromNetworkId(i);if(t){console.log("(client.controller.ts:) reached here! (2)");const r=GetEntityCoords(t,!0);SetEntityCoords(e,r[0],r[1],r[2]+.25,!0,!1,!1,!1),this.makePetFollowPlayer(!1,i)}}),1500)):this.playAnimForPed(e,"creatures@rottweiler@amb@sleep_in_kennel@","sleep_in_kennel",-1,1)}))}onPetsShouldBeDestroyed(){this._spawnedPetsInVirtualWorlds.forEach((e=>{DeleteEntity(e)})),this._spawnedPetsInVirtualWorlds=[]}makePetGreetPlayer(e,t){if(TaskGoToEntity(this._spawnedPetsInVirtualWorlds[0],t?NetworkGetEntityFromNetworkId(t):PlayerPedId(),6e3,2,4,1073741824,0),TaskLookAtEntity(this._spawnedPetsInVirtualWorlds[0],t?NetworkGetEntityFromNetworkId(t):PlayerPedId(),-1,2048,3),e){const e=GetActivePlayers(),t=[];e.forEach((e=>{if(128!==e){const r=GetPlayerServerId(e);this.getPlayerInfo("virtualWorld",r)===this.getPlayerInfo("virtualWorld")&&t.push(r)}})),t.length&&TriggerServerEvent(`${GetCurrentResourceName()}:sync-greet-with-others`,t)}}makePetFollowPlayer(e,t){if(console.log("playerPedNetworkId:",t),TaskFollowToOffsetOfEntity(this._spawnedPetsInVirtualWorlds[0],t?NetworkGetEntityFromNetworkId(t):PlayerPedId(),0,0,.5,2,-1,10,!0),e){const e=GetActivePlayers(),t=[];e.forEach((e=>{if(128!==e){const r=GetPlayerServerId(e);this.getPlayerInfo("virtualWorld",r)===this.getPlayerInfo("virtualWorld")&&t.push(r)}})),t.length&&TriggerServerEvent(`${GetCurrentResourceName()}:sync-pet-follow-with-others`,t)}}};m([a({eventName:`${GetCurrentResourceName()}:create-pet-for-player`})],k.prototype,"onPetShouldBeCreated",null),m([a({eventName:`${GetCurrentResourceName()}:destroy-pets-for-player`})],k.prototype,"onPetsShouldBeDestroyed",null),m([a({eventName:`${GetCurrentResourceName()}:make-pet-greet-player`})],k.prototype,"makePetGreetPlayer",null),m([a({eventName:`${GetCurrentResourceName()}:make-pet-follow-player`})],k.prototype,"makePetFollowPlayer",null),k=m([s()],k),new k})();