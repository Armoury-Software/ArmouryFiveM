(()=>{"use strict";var e={187:e=>{var t,i="object"==typeof Reflect?Reflect:null,n=i&&"function"==typeof i.apply?i.apply:function(e,t,i){return Function.prototype.apply.call(e,t,i)};t=i&&"function"==typeof i.ownKeys?i.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var r=Number.isNaN||function(e){return e!=e};function s(){s.init.call(this)}e.exports=s,e.exports.once=function(e,t){return new Promise((function(i,n){function r(i){e.removeListener(t,s),n(i)}function s(){"function"==typeof e.removeListener&&e.removeListener("error",r),i([].slice.call(arguments))}v(e,t,s,{once:!0}),"error"!==t&&function(e,t,i){"function"==typeof e.on&&v(e,"error",t,{once:!0})}(e,r)}))},s.EventEmitter=s,s.prototype._events=void 0,s.prototype._eventsCount=0,s.prototype._maxListeners=void 0;var o=10;function c(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function a(e){return void 0===e._maxListeners?s.defaultMaxListeners:e._maxListeners}function l(e,t,i,n){var r,s,o,l;if(c(i),void 0===(s=e._events)?(s=e._events=Object.create(null),e._eventsCount=0):(void 0!==s.newListener&&(e.emit("newListener",t,i.listener?i.listener:i),s=e._events),o=s[t]),void 0===o)o=s[t]=i,++e._eventsCount;else if("function"==typeof o?o=s[t]=n?[i,o]:[o,i]:n?o.unshift(i):o.push(i),(r=a(e))>0&&o.length>r&&!o.warned){o.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+o.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=o.length,l=u,console&&console.warn&&console.warn(l)}return e}function u(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function h(e,t,i){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:i},r=u.bind(n);return r.listener=i,n.wrapFn=r,r}function d(e,t,i){var n=e._events;if(void 0===n)return[];var r=n[t];return void 0===r?[]:"function"==typeof r?i?[r.listener||r]:[r]:i?function(e){for(var t=new Array(e.length),i=0;i<t.length;++i)t[i]=e[i].listener||e[i];return t}(r):f(r,r.length)}function p(e){var t=this._events;if(void 0!==t){var i=t[e];if("function"==typeof i)return 1;if(void 0!==i)return i.length}return 0}function f(e,t){for(var i=new Array(t),n=0;n<t;++n)i[n]=e[n];return i}function v(e,t,i,n){if("function"==typeof e.on)n.once?e.once(t,i):e.on(t,i);else{if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function r(s){n.once&&e.removeEventListener(t,r),i(s)}))}}Object.defineProperty(s,"defaultMaxListeners",{enumerable:!0,get:function(){return o},set:function(e){if("number"!=typeof e||e<0||r(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");o=e}}),s.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},s.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||r(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},s.prototype.getMaxListeners=function(){return a(this)},s.prototype.emit=function(e){for(var t=[],i=1;i<arguments.length;i++)t.push(arguments[i]);var r="error"===e,s=this._events;if(void 0!==s)r=r&&void 0===s.error;else if(!r)return!1;if(r){var o;if(t.length>0&&(o=t[0]),o instanceof Error)throw o;var c=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw c.context=o,c}var a=s[e];if(void 0===a)return!1;if("function"==typeof a)n(a,this,t);else{var l=a.length,u=f(a,l);for(i=0;i<l;++i)n(u[i],this,t)}return!0},s.prototype.addListener=function(e,t){return l(this,e,t,!1)},s.prototype.on=s.prototype.addListener,s.prototype.prependListener=function(e,t){return l(this,e,t,!0)},s.prototype.once=function(e,t){return c(t),this.on(e,h(this,e,t)),this},s.prototype.prependOnceListener=function(e,t){return c(t),this.prependListener(e,h(this,e,t)),this},s.prototype.removeListener=function(e,t){var i,n,r,s,o;if(c(t),void 0===(n=this._events))return this;if(void 0===(i=n[e]))return this;if(i===t||i.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete n[e],n.removeListener&&this.emit("removeListener",e,i.listener||t));else if("function"!=typeof i){for(r=-1,s=i.length-1;s>=0;s--)if(i[s]===t||i[s].listener===t){o=i[s].listener,r=s;break}if(r<0)return this;0===r?i.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(i,r),1===i.length&&(n[e]=i[0]),void 0!==n.removeListener&&this.emit("removeListener",e,o||t)}return this},s.prototype.off=s.prototype.removeListener,s.prototype.removeAllListeners=function(e){var t,i,n;if(void 0===(i=this._events))return this;if(void 0===i.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==i[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete i[e]),this;if(0===arguments.length){var r,s=Object.keys(i);for(n=0;n<s.length;++n)"removeListener"!==(r=s[n])&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=i[e]))this.removeListener(e,t);else if(void 0!==t)for(n=t.length-1;n>=0;n--)this.removeListener(e,t[n]);return this},s.prototype.listeners=function(e){return d(this,e,!0)},s.prototype.rawListeners=function(e){return d(this,e,!1)},s.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):p.call(e,t)},s.prototype.listenerCount=p,s.prototype.eventNames=function(){return this._eventsCount>0?t(this._events):[]}}},t={};function i(n){var r=t[n];if(void 0!==r)return r.exports;var s=t[n]={exports:{}};return e[n](s,s.exports,i),s.exports}i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{var e;!function(e){e[e.CARGO=0]="CARGO",e[e.ELECTRICITY=1]="ELECTRICITY",e[e.OIL=2]="OIL"}(e||(e={}));const t={getJobMarker:{marker:39,pos:[94.81318664550781,-2675.472412109375,5.993408203125],scale:1,rgba:[255,255,255,255],blip:{id:477,color:0,title:"Job - Trucker"},underlyingCircle:{marker:25,scale:1.75,rgba:[255,255,255,255]},renderDistance:35}},n=[{pos:[124.60220336914062,-2682.474609375,6.229248046875]}];new Map([[e.OIL,[-1207431159,-730904777,1956216962]],[e.ELECTRICITY,[-2140210194]],[e.CARGO,[-1770643266,-877478386]]]),e.OIL,e.OIL,e.OIL,e.ELECTRICITY,e.CARGO,e.CARGO,e.ELECTRICITY,e.ELECTRICITY,e.CARGO;var r=i(187);const s=e=>new Promise((t=>setTimeout(t,e))),o=(e,t,i,n,r,s,o)=>e>=n-o&&e<=n+o&&t>=r-o&&t<=r+o&&i>=s-o&&i<=s+o,c={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]};var a=function(e,t,i,n){return new(i||(i=Promise))((function(r,s){function o(e){try{a(n.next(e))}catch(e){s(e)}}function c(e){try{a(n.throw(e))}catch(e){s(e)}}function a(e){var t;e.done?r(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((n=n.apply(e,t||[])).next())}))};new class extends class extends class extends class extends class extends class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,n=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((i=void 0)||(i=Promise))((function(r,s){function o(e){try{a(n.next(e))}catch(e){s(e)}}function c(e){try{a(n.throw(e))}catch(e){s(e)}}function a(e){var t;e.done?r(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((n=n.apply(e,t||[])).next())}));var e,t,i,n})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!e.longRange),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,i,n,r){const s=GetCurrentResourceName().replace("-"," "),o=`${s.slice(0,1).toUpperCase()}${s.slice(1)}`,a=this.createBlip({id:n||1,color:i||69,title:t||o,pos:e,longRange:!0});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,c[i][0],c[i][1],c[i][2],255,0),SetBlipRoute(a,!0),r&&SetBlipRouteColour(a,r),this._waypoints.push(a),a}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,i,n,r,s,o,c,a,l,u,h,d){const p=CreateCheckpoint(e,t,i,n,r,s,o,c,a,l,u,h,d);return this._checkpoints.set(p,[t,i,n,r,s,o]),p}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>Math.floor(this._checkpoints.get(t)[0])===Math.floor(e[0])&&Math.floor(this._checkpoints.get(t)[1])===Math.floor(e[1])&&Math.floor(this._checkpoints.get(t)[2])===Math.floor(e[2])));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>a(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((t=>a(this,void 0,void 0,(function*(){var i,n,r;if(o(e[0],e[1],e[2],t.pos[0],t.pos[1],t.pos[2],t.renderDistance)){if(t.textureDict&&!HasStreamedTextureDictLoaded(t.textureDict))for(RequestStreamedTextureDict(t.textureDict,!0);!HasStreamedTextureDictLoaded(t.textureDict);)yield s(100);DrawMarker(t.marker,t.pos[0],t.pos[1],t.pos[2],0,0,0,(null===(i=t.rotation)||void 0===i?void 0:i[0])||0,(null===(n=t.rotation)||void 0===n?void 0:n[1])||0,(null===(r=t.rotation)||void 0===r?void 0:r[2])||0,t.scale,t.scale,t.scale,t.rgba[0],t.rgba[1],t.rgba[2],t.rgba[3],!1,!0,2,!1,t.textureDict||null,t.textureName||null,!1),t.underlyingCircle&&DrawMarker(t.underlyingCircle.marker,t.pos[0],t.pos[1],t.pos[2]-.9,0,0,0,0,0,0,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.scale,t.underlyingCircle.rgba[0]||t.rgba[0],t.underlyingCircle.rgba[1]||t.rgba[1],t.underlyingCircle.rgba[2]||t.rgba[2],t.underlyingCircle.rgba[3]||t.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,t,i,n,r,o,c,l=!1){return a(this,void 0,void 0,(function*(){let a=0;for(RequestModel(e);!HasModelLoaded(e);){if(a>10)return 0;yield s(100),a++}const u=CreateVehicle(e,t,i,n,r,o,c);return u&&(c&&this._vehicles.push(u),l&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),u,-1)),u}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,t,i,n,r,o){return a(this,void 0,void 0,(function*(){let c=0;for(RequestModel(i);!HasModelLoaded(i);){if(c>10)return 0;yield s(100),c++}const a=CreatePedInsideVehicle(e,t,i,n,r,o);return a&&this._peds.push(a),a}))}createPedAsync(e,t,i,n,r,o,c,l){return a(this,void 0,void 0,(function*(){let a=0;for(RequestModel(t);!HasModelLoaded(t);){if(a>10)return 0;yield s(100),a++}const u=CreatePed(e,t,i,n,r,o,c,l);return u&&this._peds.push(u),u}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}}{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((i=>{o(e[0],e[1],e[2],i.pos[0],i.pos[1],i.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(i.action(),i.once&&t.push(i))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}{getPlayerInfo(e){let t=GetConvar(`${i.g.GetPlayerServerId(i.g.PlayerId())}_PI_${e}`,"-1");var n;return n=t.toString(),!/^\s*$/.test(n)&&(n=(n=(n=n.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(n))&&(t=JSON.parse(t.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),t}}{constructor(){super(),this.uiDisplay=!1,this.uiDisplayCooldownTimestamp=0,this.onIncomingUIMessageEvent=new r,this.addDefaultListeners()}isUIShowing(){return this.uiDisplay}isUIOnCooldown(){return Date.now()<this.uiDisplayCooldownTimestamp}showUI(){this.isUIShowing()||(EnterCursorMode(),SetNuiFocus(!0,!0),SetNuiFocusKeepInput(!1)),this.uiDisplay=!0,this.addToTickUnique({id:`${GetCurrentResourceName()}_UI`,function:()=>{DisableControlAction(0,1,this.uiDisplay),DisableControlAction(0,2,this.uiDisplay),DisableControlAction(0,142,this.uiDisplay),DisableControlAction(0,18,this.uiDisplay),DisableControlAction(0,322,this.uiDisplay),DisableControlAction(0,106,this.uiDisplay),this.uiDisplay||(this.removeFromTick(`${GetCurrentResourceName()}_UI`),SetNuiFocus(!1,!1))}})}hideUI(){this.uiDisplayCooldownTimestamp=Date.now()+3e3,LeaveCursorMode(),this.uiDisplay=!1,SendNuiMessage(JSON.stringify({type:"dismiss"}))}addUIListener(e){RegisterNuiCallbackType(e),on(`__cfx_nui:${e}`,((t,i)=>{this.onIncomingUIMessageEvent.emit(e,t),i("ok")})),this.onIncomingUIMessageEvent.on(e,(t=>{this.onIncomingUIMessage.call(this,e,t)}))}onIncomingUIMessage(e,t){}onForceShowUI(e){this.showUI()}onForceHideUI(){this.hideUI()}addDefaultListeners(){RegisterNuiCallbackType("dismiss"),on("__cfx_nui:dismiss",((e,t)=>{this.onForceHideUI(),t("ok")})),onNet(`${GetCurrentResourceName()}:force-showui`,(e=>{this.onForceShowUI(e)}))}}{constructor(){super(),this.createBlips([Object.assign(Object.assign({},t.getJobMarker.blip),{pos:t.getJobMarker.pos})]),this.createMarkers([t.getJobMarker]),this.createActionPoints({pos:t.getJobMarker.pos,action:()=>{this.isUIShowing()||this.isUIOnCooldown()||this.showTruckerMenu()}}),this.addControllerListeners(),this.addUIListener("buttonclick")}onIncomingUIMessage(e,t){if(super.onIncomingUIMessage(e,t),"buttonclick"===e)switch(t.buttonId){case 0:TriggerServerEvent(`${GetCurrentResourceName()}:quick-start`,IsPedInAnyVehicle(GetPlayerPed(-1),!1)),this.hideUI();break;case 3:TriggerServerEvent(`${GetCurrentResourceName()}:get-job`)}}showTruckerMenu(){this.updateUIData(),this.showUI()}addControllerListeners(){onNet(`${GetCurrentResourceName()}:begin-job`,(e=>{return t=this,i=void 0,s=function*(){const t=this.createWaypoint([e.X,e.Y,e.Z],"Job - Trucker - Delivery Point",69,652);let i;this.createActionPoints({pos:[e.X,e.Y,e.Z],action:()=>{this.finishDelivery(),this.clearWaypoint(t)},once:!0}),IsPedInAnyVehicle(GetPlayerPed(-1),!1)?i=GetVehiclePedIsIn(GetPlayerPed(-1),!1):(i=yield this.createVehicleAsync(1518533038,n[0].pos[0],n[0].pos[1],n[0].pos[2],0,!0,!0),TaskWarpPedIntoVehicle(GetPlayerPed(-1),i,-1));const r=GetOffsetFromEntityInWorldCoords(i,0,8,0),s=yield this.createVehicleAsync(-730904777,r[0],r[1],r[2],0,!0,!0);AttachVehicleToTrailer(i,s,100)},new((r=void 0)||(r=Promise))((function(e,n){function o(e){try{a(s.next(e))}catch(e){n(e)}}function c(e){try{a(s.throw(e))}catch(e){n(e)}}function a(t){var i;t.done?e(t.value):(i=t.value,i instanceof r?i:new r((function(e){e(i)}))).then(o,c)}a((s=s.apply(t,i||[])).next())}));var t,i,r,s})),onNet(`${GetCurrentResourceName()}:job-assigned`,(()=>{var e,t,i,n,r,o;e=()=>"trucker"===this.getPlayerInfo("job"),t=()=>{this.updateUIData()},i=void 0,n=void 0,o=function*(){for(;!e();)yield s(10);t()},new((r=void 0)||(r=Promise))((function(e,t){function s(e){try{a(o.next(e))}catch(e){t(e)}}function c(e){try{a(o.throw(e))}catch(e){t(e)}}function a(t){var i;t.done?e(t.value):(i=t.value,i instanceof r?i:new r((function(e){e(i)}))).then(s,c)}a((o=o.apply(i,n||[])).next())}))}))}onForceShowUI(){this.showTruckerMenu()}onForceHideUI(){super.onForceHideUI()}updateUIData(){const e="trucker"===this.getPlayerInfo("job");SendNuiMessage(JSON.stringify({type:"update",title:"Trucker Job",description:"Truckers deliver international cargo for usage in stores and other local businesses. They also help decentralize traffic outside the main area of influence.",resource:"trucker-job",buttons:[{title:"Quick start",subtitle:"Start a quick, random delivery route",icon:"play_arrow",disabled:!e,tooltip:e?"":"You are not a trucker"},{title:"Legal delivery",subtitle:"Select a legal truck delivery",icon:"local_shipping",disabled:!e,tooltip:e?"":"You are not a trucker"},{title:"Illegal delivery (unavailable)",subtitle:"Select an illegal truck delivery",icon:"science",disabled:!e,tooltip:e?"":"You are not a trucker"},{title:e?"Already a trucker":"Get employed",subtitle:e?"You are already a trucker":"Become a trucker",icon:"badge",unlocked:e}]}))}finishDelivery(){emitNet(`${GetCurrentResourceName()}:job-finished`),DeleteEntity(GetVehicleTrailerVehicle(GetVehiclePedIsUsing(GetPlayerPed(-1)))[1])}}})()})();