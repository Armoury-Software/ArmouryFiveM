(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}();const t={items:[{label:"Give Self",active:!0},{label:"Teleports"},{label:"Player Administration"}],title:"Admin Menu",id:"admin-menu"},i={items:[{label:"Give Weapon",active:!0},{label:"Give Drugs"},{label:"Give Money"}],title:"Admin Menu: Give Self",id:"give-self-menu"},n={items:[],title:"Admin Menu: Give Weapon",id:"give-weapon"},s=e=>new Promise((t=>setTimeout(t,e))),r=(e,t,i,n,s,r,o)=>e>=n-o&&e<=n+o&&t>=s-o&&t<=s+o&&i>=r-o&&i<=r+o,o={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]};var a=function(e,t,i,n){return new(i||(i=Promise))((function(s,r){function o(e){try{c(n.next(e))}catch(e){r(e)}}function a(e){try{c(n.throw(e))}catch(e){r(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,a)}c((n=n.apply(e,t||[])).next())}))};const c={2578778090:"Knife",1737195953:"Nightstick",1317494643:"Hammer",2508868239:"Bat",1141786504:"Golf Club",2227010557:"Crowbar",4192643659:"Bottle",3756226112:"Switch Blade",453432689:"Pistol",1593441988:"Combat Pistol",584646201:"AP Pistol",2578377531:"Pistol 50",1198879012:"Flare Gun",3696079510:"Marksman Pistol",3249783761:"Revolver",324215364:"Micro SMG",736523883:"SMG",4024951519:"Assault SMG",171789620:"Combat PDW",3220176749:"Assault Rifle",2210333304:"Carbine Rifle",2937143193:"Advanced Rifle",1649403952:"Compact Rifle",2634544996:"MG",2144741730:"Combat MG",487013001:"Pump Shotgun",2017895192:"Sawn Off Shotgun",3800352039:"Assault Shotgun",2640438543:"Bullpup Shotgun",4019527611:"Double Barrel Shotgun",911657153:"Stun Gun",100416529:"Sniper Rifle",205991906:"Heavy Sniper",2726580491:"Grenade Launcher",1305664598:"Grenade Launcher Smoke",2982836145:"RPG",1119849093:"Minigun",2481070269:"Grenade",741814745:"Sticky Bomb",4256991824:"Smoke Grenade",2694266206:"BZ Gas",615608432:"Molotov",101631238:"Fire Extinguisher",883325847:"Petrol Can",3218215474:"SNS Pistol",3231910285:"Special Carbine",3523564046:"Heavy Pistol",2132975508:"Bullpup Rifle",1672152130:"Homing Launcher",2874559379:"Proximity Mine",126349499:"Snowball",137902532:"Vintage Pistol",2460120199:"Dagger",2138347493:"Firework",2828843422:"Musket",3342088282:"Marksman Rifle",984333226:"Heavy Shotgun",1627465347:"Gusenberg",4191993645:"Hatchet",1834241177:"Railgun",2725352035:"Unarmed",3638508604:"Knuckle Duster",3713923289:"Machete",3675956304:"Machine Pistol",2343591895:"Flashlight",600439132:"Ball",1233104067:"Flare",2803906140:"Night Vision",4222310262:"Parachute",317205821:"Sweeper Shotgun",3441901897:"Battle Axe",125959754:"Compact Grenade Launcher",3173288789:"Mini SMG",3125143736:"Pipe Bomb",2484171525:"Pool Cue",419712736:"Wrench",3219281620:"Pistol Mk2",961495388:"Assault Rifle Mk2",4208062921:"Carbine Rifle Mk2",3686625920:"Combat MG Mk2",177293209:"Heavy Sniper Mk2",2024373456:"SMG Mk2"};new class extends class extends class extends class extends class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,n=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((i=void 0)||(i=Promise))((function(s,r){function o(e){try{c(n.next(e))}catch(e){r(e)}}function a(e){try{c(n.throw(e))}catch(e){r(e)}}function c(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,a)}c((n=n.apply(e,t||[])).next())}));var e,t,i,n})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!e.longRange),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,i,n,s){const r=GetCurrentResourceName().replace("-"," "),a=`${r.slice(0,1).toUpperCase()}${r.slice(1)}`,c=this.createBlip({id:n||1,color:i||69,title:t||a,pos:e,longRange:!0});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,o[i][0],o[i][1],o[i][2],255,0),SetBlipRoute(c,!0),s&&SetBlipRouteColour(c,s),this._waypoints.push(c),c}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,i,n,s,r,o,a,c,l,u,h,d){const p=CreateCheckpoint(e,t,i,n,s,r,o,a,c,l,u,h,d);return this._checkpoints.set(p,[t,i,n,s,r,o]),p}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>Math.floor(this._checkpoints.get(t)[0])===Math.floor(e[0])&&Math.floor(this._checkpoints.get(t)[1])===Math.floor(e[1])&&Math.floor(this._checkpoints.get(t)[2])===Math.floor(e[2])));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>a(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((t=>a(this,void 0,void 0,(function*(){var i,n,o;if(r(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],t.renderDistance)){if(t.textureDict&&!HasStreamedTextureDictLoaded(t.textureDict))for(RequestStreamedTextureDict(t.textureDict,!0);!HasStreamedTextureDictLoaded(t.textureDict);)yield s(100);DrawMarker(t.marker,t.pos[0],t.pos[1],t.pos[2],0,0,0,(null===(i=t.rotation)||void 0===i?void 0:i[0])||0,(null===(n=t.rotation)||void 0===n?void 0:n[1])||0,(null===(o=t.rotation)||void 0===o?void 0:o[2])||0,t.scale,t.scale,t.scale,t.rgba[0],t.rgba[1],t.rgba[2],t.rgba[3],!1,!0,2,!1,t.textureDict||null,t.textureName||null,!1),t.underlyingCircle&&DrawMarker(t.underlyingCircle.marker,t.pos[0],t.pos[1],t.pos[2]-.9,0,0,0,0,0,0,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.rgba[0]||t.rgba[0],t.underlyingCircle.rgba[1]||t.rgba[1],t.underlyingCircle.rgba[2]||t.rgba[2],t.underlyingCircle.rgba[3]||t.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,t,i,n,r,o,c,l=!1){return a(this,void 0,void 0,(function*(){let a=0;for(RequestModel(e);!HasModelLoaded(e);){if(a>10)return 0;yield s(100),a++}const u=CreateVehicle(e,t,i,n,r,o,c);return u&&(c&&this._vehicles.push(u),l&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),u,-1)),u}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,t,i,n,r,o){return a(this,void 0,void 0,(function*(){let a=0;for(RequestModel(i);!HasModelLoaded(i);){if(a>10)return 0;yield s(100),a++}const c=CreatePedInsideVehicle(e,t,i,n,r,o);return c&&this._peds.push(c),c}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}}{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((i=>{r(e[0],e[1],e[2],i.pos[0],i.pos[1],i.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(i.action(),i.once&&t.push(i))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}{getPlayerInfo(t){let i=GetConvar(`${e.g.GetPlayerServerId(e.g.PlayerId())}_PI_${t}`,"-1");var n;return n=i.toString(),!/^\s*$/.test(n)&&(n=(n=(n=n.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(n))&&(i=JSON.parse(i.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),i}}{constructor(){super(),this.deathEventTriggered=!1,this.menuToggles=new Map,this.assignListeners(),this.registerKeyBindings(),this.registerGlobalEvents()}assignListeners(){const e=[247.83297729492188,-343.20001220703125,44.4615478515625,0,0,158.7401580810547];on("onClientGameTypeStart",(()=>{globalThis.exports.spawnmanager.setAutoSpawnCallback((()=>{globalThis.exports.spawnmanager.spawnPlayer({x:e[0],y:e[1],z:e[2],model:"a_m_m_skater_01"},(()=>{emit("chat:addMessage",{args:["Welcome to the party!~"]}),SetEntityRotation(GetPlayerPed(-1),e[3],e[4],e[5],2,!0)}))})),globalThis.exports.spawnmanager.setAutoSpawn(!0),globalThis.exports.spawnmanager.forceRespawn()})),on("armoury-overlay:context-menu-item-pressed",(e=>{switch(console.log(`on ${e}`),e.menuId){case"admin-menu":"give self"===e.buttonSelected.label.toLowerCase()&&TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`,i);break;case"give-self-menu":if("give weapon"===e.buttonSelected.label.toLowerCase()){let e=[];for(let t in c)e.push(c[t]);TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`,Object.assign(Object.assign({},n),{items:e.map(((e,t)=>({label:e,active:!t})))}))}case"give-weapon":const t=this.getPlayerInfo("name");ExecuteCommand(`giveweapon ${t.toLowerCase()} ${e.buttonSelected.label.replaceAll(" ","")} 150`)}}))}registerGlobalEvents(){on("gameEventTriggered",((e,t)=>{"CEventNetworkEntityDamage"===e&&(this.deathEventTriggered||GetEntityHealth(GetPlayerPed(-1))||(this.deathEventTriggered=!0,TriggerServerEvent(`${GetCurrentResourceName()}:onPlayerDeath`),setTimeout((()=>{this.deathEventTriggered=!1}),3e3)))}))}registerKeyBindings(){RegisterCommand("+opengeneralmenu",(()=>{!0!==this.menuToggles.get("general-menu")?(TriggerServerEvent(`${GetCurrentResourceName()}:open-general-menu`),this.menuToggles.set("general-menu",!0)):this.menuToggles.set("general-menu",!1)}),!1),RegisterKeyMapping("+opengeneralmenu","Open General Menu","keyboard","k"),RegisterCommand("+openadminmenu",(()=>{if(this.getPlayerInfo("adminLevel")>0){if(!0===this.menuToggles.get("admin-menu"))return this.menuToggles.set("admin-menu",!1),void emit("armoury-overlay:hide-context-menu");TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`,t),this.menuToggles.set("admin-menu",!0)}}),!1),RegisterKeyMapping("+openadminmenu","Open Admin Menu","keyboard","f1")}}})();