(()=>{"use strict";var e={187:e=>{var t,i="object"==typeof Reflect?Reflect:null,n=i&&"function"==typeof i.apply?i.apply:function(e,t,i){return Function.prototype.apply.call(e,t,i)};t=i&&"function"==typeof i.ownKeys?i.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var s=Number.isNaN||function(e){return e!=e};function r(){r.init.call(this)}e.exports=r,e.exports.once=function(e,t){return new Promise((function(i,n){function s(i){e.removeListener(t,r),n(i)}function r(){"function"==typeof e.removeListener&&e.removeListener("error",s),i([].slice.call(arguments))}g(e,t,r,{once:!0}),"error"!==t&&function(e,t,i){"function"==typeof e.on&&g(e,"error",t,{once:!0})}(e,s)}))},r.EventEmitter=r,r.prototype._events=void 0,r.prototype._eventsCount=0,r.prototype._maxListeners=void 0;var o=10;function c(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function a(e){return void 0===e._maxListeners?r.defaultMaxListeners:e._maxListeners}function l(e,t,i,n){var s,r,o,l;if(c(i),void 0===(r=e._events)?(r=e._events=Object.create(null),e._eventsCount=0):(void 0!==r.newListener&&(e.emit("newListener",t,i.listener?i.listener:i),r=e._events),o=r[t]),void 0===o)o=r[t]=i,++e._eventsCount;else if("function"==typeof o?o=r[t]=n?[i,o]:[o,i]:n?o.unshift(i):o.push(i),(s=a(e))>0&&o.length>s&&!o.warned){o.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+o.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=o.length,l=u,console&&console.warn&&console.warn(l)}return e}function u(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function h(e,t,i){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:i},s=u.bind(n);return s.listener=i,n.wrapFn=s,s}function p(e,t,i){var n=e._events;if(void 0===n)return[];var s=n[t];return void 0===s?[]:"function"==typeof s?i?[s.listener||s]:[s]:i?function(e){for(var t=new Array(e.length),i=0;i<t.length;++i)t[i]=e[i].listener||e[i];return t}(s):f(s,s.length)}function d(e){var t=this._events;if(void 0!==t){var i=t[e];if("function"==typeof i)return 1;if(void 0!==i)return i.length}return 0}function f(e,t){for(var i=new Array(t),n=0;n<t;++n)i[n]=e[n];return i}function g(e,t,i,n){if("function"==typeof e.on)n.once?e.once(t,i):e.on(t,i);else{if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function s(r){n.once&&e.removeEventListener(t,s),i(r)}))}}Object.defineProperty(r,"defaultMaxListeners",{enumerable:!0,get:function(){return o},set:function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");o=e}}),r.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},r.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||s(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},r.prototype.getMaxListeners=function(){return a(this)},r.prototype.emit=function(e){for(var t=[],i=1;i<arguments.length;i++)t.push(arguments[i]);var s="error"===e,r=this._events;if(void 0!==r)s=s&&void 0===r.error;else if(!s)return!1;if(s){var o;if(t.length>0&&(o=t[0]),o instanceof Error)throw o;var c=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw c.context=o,c}var a=r[e];if(void 0===a)return!1;if("function"==typeof a)n(a,this,t);else{var l=a.length,u=f(a,l);for(i=0;i<l;++i)n(u[i],this,t)}return!0},r.prototype.addListener=function(e,t){return l(this,e,t,!1)},r.prototype.on=r.prototype.addListener,r.prototype.prependListener=function(e,t){return l(this,e,t,!0)},r.prototype.once=function(e,t){return c(t),this.on(e,h(this,e,t)),this},r.prototype.prependOnceListener=function(e,t){return c(t),this.prependListener(e,h(this,e,t)),this},r.prototype.removeListener=function(e,t){var i,n,s,r,o;if(c(t),void 0===(n=this._events))return this;if(void 0===(i=n[e]))return this;if(i===t||i.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete n[e],n.removeListener&&this.emit("removeListener",e,i.listener||t));else if("function"!=typeof i){for(s=-1,r=i.length-1;r>=0;r--)if(i[r]===t||i[r].listener===t){o=i[r].listener,s=r;break}if(s<0)return this;0===s?i.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(i,s),1===i.length&&(n[e]=i[0]),void 0!==n.removeListener&&this.emit("removeListener",e,o||t)}return this},r.prototype.off=r.prototype.removeListener,r.prototype.removeAllListeners=function(e){var t,i,n;if(void 0===(i=this._events))return this;if(void 0===i.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==i[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete i[e]),this;if(0===arguments.length){var s,r=Object.keys(i);for(n=0;n<r.length;++n)"removeListener"!==(s=r[n])&&this.removeAllListeners(s);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=i[e]))this.removeListener(e,t);else if(void 0!==t)for(n=t.length-1;n>=0;n--)this.removeListener(e,t[n]);return this},r.prototype.listeners=function(e){return p(this,e,!0)},r.prototype.rawListeners=function(e){return p(this,e,!1)},r.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):d.call(e,t)},r.prototype.listenerCount=d,r.prototype.eventNames=function(){return this._eventsCount>0?t(this._events):[]}}},t={};function i(n){var s=t[n];if(void 0!==s)return s.exports;var r=t[n]={exports:{}};return e[n](r,r.exports,i),r.exports}i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{var e=i(187);const t=e=>new Promise((t=>setTimeout(t,e))),n=(e,t,i,n,s,r,o)=>e>=n-o&&e<=n+o&&t>=s-o&&t<=s+o&&i>=r-o&&i<=r+o,s=["k","M","G","T","P","E"],r=(e,t)=>{let i=e<0;if(e=Math.abs(e),Number.isNaN(e))return null;if(e<1e3)return e;const n=Math.floor(Math.log(e)/Math.log(1e3));return(i?"-":"")+(e/Math.pow(1e3,n)).toFixed(t)+s[n-1]},o={0:[255,255,255],1:[224,50,50],2:[93,189,113],3:[93,182,229],4:[255,255,255],5:[238,198,78],6:[194,80,80],7:[156,110,175],8:[254,122,195],9:[245,157,121],10:[177,143,131],11:[141,206,167],12:[112,168,174],13:[211,209,231],14:[143,126,152],15:[106,196,191],16:[213,195,152],17:[234,142,80],18:[151,202,233],19:[178,98,135],20:[143,141,121],21:[166,117,94],22:[175,168,168],23:[231,141,154],24:[187,214,91],25:[12,123,86],26:[122,195,254],27:[171,60,230],28:[205,168,12],29:[69,97,171],30:[41,165,184],31:[184,155,123],32:[200,224,254],33:[240,240,150],34:[237,140,161],35:[249,138,138],36:[251,238,165],37:[255,255,255],38:[40,96,160],39:[145,131,112],40:[76,76,76],41:[242,157,157],42:[108,183,214],43:[175,237,174],44:[255,167,95],45:[241,241,241],46:[236,240,41],47:[255,154,24],48:[246,68,165],49:[224,58,58],50:[138,109,227],51:[255,127,70],52:[49,96,65],53:[179,221,243],54:[58,100,121],55:[160,160,160],56:[132,114,50],57:[101,185,231],58:[75,65,117],59:[225,59,59],60:[240,203,88],61:[205,63,152],62:[207,207,207],63:[39,106,159],64:[216,123,27],65:[142,131,147],66:[240,203,87],67:[101,185,231],68:[101,185,231],69:[121,205,121],70:[239,202,87],71:[239,202,87],72:[61,61,61],73:[239,202,87],74:[73,168,231],75:[224,50,50],76:[120,35,35],77:[101,185,231],78:[58,100,121],79:[224,50,50],80:[101,185,231],81:[242,164,12],82:[164,204,170],83:[168,84,242],84:[101,185,231],85:[61,61,61]};var c=function(e,t,i,n){return new(i||(i=Promise))((function(s,r){function o(e){try{a(n.next(e))}catch(e){r(e)}}function c(e){try{a(n.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((n=n.apply(e,t||[])).next())}))};new class extends class extends class extends class extends class extends class extends class{constructor(){this.tickInstance=null,this.tickFunctions=[],this.routingBucket=0,this.assignBaseListeners()}addToTick(...e){e.forEach((e=>{-1!==this.tickFunctions.findIndex((t=>t.id===e.id))&&console.error(`[ClientBase]: A tick function with the id ${e.id} already exists in the stack! The newly added tick function will not be executed.`)})),this.tickFunctions.push(...e),this.removeTickDuplicates(),this.refreshTicks()}addToTickUnique(...e){e.forEach((e=>{this.removeFromTick(e.id)})),this.addToTick(...e)}removeFromTick(e){this.tickFunctions=this.tickFunctions.filter((t=>t.id!=e))}refreshTicks(){this.tickInstance&&(clearTick(this.tickInstance),this.tickInstance=null),this.tickFunctions.length>0&&(this.tickInstance=setTick((()=>{return e=this,t=void 0,n=function*(){if(!this.tickFunctions.length)return clearTick(this.tickInstance),void(this.tickInstance=null);this.tickFunctions.forEach((e=>{e.function()}))},new((i=void 0)||(i=Promise))((function(s,r){function o(e){try{a(n.next(e))}catch(e){r(e)}}function c(e){try{a(n.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(o,c)}a((n=n.apply(e,t||[])).next())}));var e,t,i,n})))}removeTickDuplicates(){this.tickFunctions=this.tickFunctions.filter((e=>this.tickFunctions.findIndex((t=>t.id==e.id))==this.tickFunctions.indexOf(e)))}assignBaseListeners(){onNet(`${GetCurrentResourceName()}:set-routing-bucket`,(e=>{this.routingBucket=e}))}setEntityRoutingBucket(e){TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`,e),this.routingBucket=e}}{constructor(){super(),this._blips=[],this._markers=[],this._vehicles=[],this._peds=[],this._waypoints=[],this._checkpoints=new Map,this.assignDefaultEntityListeners()}get blips(){return this._blips}get markers(){return this._markers}get vehicles(){return this._vehicles}get peds(){return this._peds}get waypoints(){return this._waypoints}get checkpoints(){return this._checkpoints}createBlips(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._blips.push(...t),this.refreshBlips()}createBlip(e){const t=AddBlipForCoord(e.pos[0],e.pos[1],e.pos[2]);return SetBlipSprite(t,e.id),SetBlipDisplay(t,4),SetBlipScale(t,1),SetBlipColour(t,e.color),SetBlipAsShortRange(t,!0),BeginTextCommandSetBlipName("STRING"),AddTextComponentString(e.title),EndTextCommandSetBlipName(t),t}clearBlips(){this._blips.forEach((e=>{RemoveBlip(e.instance)})),this._blips=[]}refreshBlips(){this.blips.forEach((e=>{e.instance||(e.instance=this.createBlip(e))}))}createWaypoint(e,t,i,n,s){const r=GetCurrentResourceName().replace("-"," "),c=`${r.slice(0,1).toUpperCase()}${r.slice(1)}`,a=this.createBlip({id:n||1,color:i||69,title:t||c,pos:e});return this.createCheckpoint(2,e[0],e[1],e[2],null,null,null,3,o[i][0],o[i][1],o[i][2],255,0),SetBlipRoute(a,!0),s&&SetBlipRouteColour(a,s),this._waypoints.push(a),a}clearWaypoints(){this._waypoints.forEach((e=>{this.clearWaypoint(e,!0)})),this._waypoints=[]}clearWaypoint(e,t=!1){this.clearCheckpointByPosition(GetBlipCoords(e)),SetBlipRoute(e,!1),RemoveBlip(e),t||this._waypoints.splice(this._waypoints.indexOf(e),1)}createCheckpoint(e,t,i,n,s,r,o,c,a,l,u,h,p){const d=CreateCheckpoint(e,t,i,n,s,r,o,c,a,l,u,h,p);return this._checkpoints.set(d,[t,i,n,s,r,o]),d}clearCheckpoint(e){DeleteCheckpoint(e),this._checkpoints.has(e)&&this._checkpoints.delete(e)}clearCheckpointByPosition(e){const t=Array.from(this._checkpoints.keys()).find((t=>this._checkpoints.get(t)[0]===e[0]&&this._checkpoints.get(t)[1]===e[1]&&this._checkpoints.get(t)[2]===e[2]));t&&this.clearCheckpoint(t)}createMarkers(e){const t=e.map((e=>Object.assign(Object.assign({},e),{instance:null})));this._markers.push(...t),this.refreshMarkers()}clearMarkers(){this._markers=[],this.removeFromTick(`${GetCurrentResourceName()}_markers`)}refreshMarkers(){this.addToTickUnique({id:`${GetCurrentResourceName()}_markers`,function:()=>c(this,void 0,void 0,(function*(){const e=GetEntityCoords(GetPlayerPed(-1),!0);this._markers.forEach((i=>c(this,void 0,void 0,(function*(){var s,r,o;if(n(e[0],e[1],e[2],i.pos[0],i.pos[1],i.pos[2],i.renderDistance)){if(i.textureDict&&!HasStreamedTextureDictLoaded(i.textureDict))for(RequestStreamedTextureDict(i.textureDict,!0);!HasStreamedTextureDictLoaded(i.textureDict);)yield t(100);DrawMarker(i.marker,i.pos[0],i.pos[1],i.pos[2],0,0,0,(null===(s=i.rotation)||void 0===s?void 0:s[0])||0,(null===(r=i.rotation)||void 0===r?void 0:r[1])||0,(null===(o=i.rotation)||void 0===o?void 0:o[2])||0,i.scale,i.scale,i.scale,i.rgba[0],i.rgba[1],i.rgba[2],i.rgba[3],!1,!0,2,!1,i.textureDict||null,i.textureName||null,!1),i.underlyingCircle&&DrawMarker(i.underlyingCircle.marker,i.pos[0],i.pos[1],i.pos[2]-.9,0,0,0,0,0,0,i.underlyingCircle.scale,i.underlyingCircle.scale,i.underlyingCircle.scale,i.underlyingCircle.rgba[0]||i.rgba[0],i.underlyingCircle.rgba[1]||i.rgba[1],i.underlyingCircle.rgba[2]||i.rgba[2],i.underlyingCircle.rgba[3]||i.rgba[3],!1,!0,2,!1,null,null,!1)}}))))}))})}createVehicleAsync(e,i,n,s,r,o,a,l=!1){return c(this,void 0,void 0,(function*(){let c=0;for(RequestModel(e);!HasModelLoaded(e);){if(c>10)return 0;yield t(100),c++}const u=CreateVehicle(e,i,n,s,r,o,a);return u&&(a&&this._vehicles.push(u),l&&TaskWarpPedIntoVehicle(GetPlayerPed(-1),u,-1)),u}))}removeVehicle(e){DoesEntityExist(e)&&DeleteEntity(e),this._vehicles.indexOf(e)>-1&&this._vehicles.splice(this._vehicles.indexOf(e),1)}removePed(e){DoesEntityExist(e)&&DeleteEntity(e),this._peds.indexOf(e)>-1&&this._peds.splice(this._peds.indexOf(e),1)}createPedInsideVehicleAsync(e,i,n,s,r,o){return c(this,void 0,void 0,(function*(){let c=0;for(RequestModel(n);!HasModelLoaded(n);){if(c>10)return 0;yield t(100),c++}const a=CreatePedInsideVehicle(e,i,n,s,r,o);return a&&this._peds.push(a),a}))}assignDefaultEntityListeners(){onNet("onResourceStop",(e=>{e===GetCurrentResourceName()&&(this._vehicles.forEach((e=>{this.removeVehicle(e)})),this._peds.forEach((e=>{this.removePed(e)})),this._vehicles=[],this._peds=[])}))}}{constructor(){super(...arguments),this._actionPoints=[]}get actionPoints(){return this._actionPoints}createActionPoints(...e){this._actionPoints.push(...e),this.refreshActionPoints()}clearActionPoints(){this._actionPoints=[],this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`)}removeActionPoint(e){this._actionPoints=this._actionPoints.filter((t=>!(e.pos[0]===t.pos[0]&&e.pos[1]===t.pos[1]&&e.pos[2]===t.pos[2]))),this._actionPoints.length||this.clearActionPoints()}refreshActionPoints(){this.addToTickUnique({id:`${GetCurrentResourceName()}_actionpoints`,function:()=>{const e=GetEntityCoords(GetPlayerPed(-1),!0);let t=[];this._actionPoints.forEach((i=>{n(e[0],e[1],e[2],i.pos[0],i.pos[1],i.pos[2],1*(IsPedInAnyVehicle(GetPlayerPed(-1),!1)?4:1))&&(i.action(),i.once&&t.push(i))})),t.length>0&&(t.forEach((e=>{this._actionPoints.splice(this._actionPoints.indexOf(e),1)})),t=[])}})}}{constructor(){super(...arguments),this.timeBetweenFeeds=8e3}addToFeed(...e){e.forEach(((e,t)=>{setTimeout((()=>{BeginTextCommandThefeedPost("STRING"),AddTextComponentSubstringPlayerName(e),EndTextCommandThefeedPostTicker(!1,!0)}),t*this.timeBetweenFeeds)}))}}{getPlayerInfo(e){let t=GetConvar(`${i.g.GetPlayerServerId(i.g.PlayerId())}_PI_${e}`,"-1");var n;return n=t.toString(),!/^\s*$/.test(n)&&(n=(n=(n=n.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@")).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]")).replace(/(?:^|:|,)(?:\s*\[)+/g,""),/^[\],:{}\s]*$/.test(n))&&(t=JSON.parse(t.toString(),(function(e,t){return"object"==typeof t||isNaN(t)?t:Number(t)}))),t}}{constructor(){super(),this.uiDisplay=!1,this.uiDisplayCooldownTimestamp=0,this.onIncomingUIMessageEvent=new e,this.addDefaultListeners()}isUIShowing(){return this.uiDisplay}isUIOnCooldown(){return Date.now()<this.uiDisplayCooldownTimestamp}showUI(){EnterCursorMode(),SetNuiFocus(!0,!0),SetNuiFocusKeepInput(!1),this.uiDisplay=!0,this.addToTickUnique({id:`${GetCurrentResourceName()}_UI`,function:()=>{DisableControlAction(0,1,this.uiDisplay),DisableControlAction(0,2,this.uiDisplay),DisableControlAction(0,142,this.uiDisplay),DisableControlAction(0,18,this.uiDisplay),DisableControlAction(0,322,this.uiDisplay),DisableControlAction(0,106,this.uiDisplay),this.uiDisplay||(this.removeFromTick(`${GetCurrentResourceName()}_UI`),SetNuiFocus(!1,!1))}})}hideUI(){this.uiDisplayCooldownTimestamp=Date.now()+3e3,LeaveCursorMode(),this.uiDisplay=!1,SendNuiMessage(JSON.stringify({type:"dismiss"}))}addUIListener(e){RegisterNuiCallbackType(e),on(`__cfx_nui:${e}`,((t,i)=>{this.onIncomingUIMessageEvent.emit(e,t),i("ok")})),this.onIncomingUIMessageEvent.on(e,(t=>{this.onIncomingUIMessage.call(this,e,t)}))}onIncomingUIMessage(e,t){}onForceShowUI(e){this.showUI()}onForceHideUI(){this.hideUI()}addDefaultListeners(){RegisterNuiCallbackType("dismiss"),on("__cfx_nui:dismiss",((e,t)=>{this.hideUI(),t("ok")})),onNet(`${GetCurrentResourceName()}:force-showui`,(e=>{this.onForceShowUI(e)}))}}{constructor(){super(),this.addUIListener("add-contact"),this.addUIListener("request-service-call"),this.addUIListener("dialogbuttonclick"),this.addUIListener("execute-call"),this.addUIListener("refuse-call"),this.addUIListener("answer-call"),this.addUIListener("hangup-call"),this.registerListeners(),this.registerKeyBindings()}onForceHideUI(){super.onForceHideUI()}onForceShowUI(e){const t=this.isUIShowing();super.onForceShowUI(e),this.showPhoneUI(e,t)}onIncomingUIMessage(e,t){if(super.onIncomingUIMessage(e,t),"add-contact"===e&&TriggerServerEvent(`${GetCurrentResourceName()}:add-contact`,t),"request-service-call"===e){const e=t;IsWaypointActive()?TriggerServerEvent(`${GetCurrentResourceName()}:request-service-call`,e):this.showDialog({message:"You need to have set a waypoint on the map before calling for a taxi!",buttons:[{title:"Ok"}]})}"execute-call"===e&&(console.log("received execute-call event. attempting to make a call.."),console.log("event data: ",t),TriggerServerEvent(`${GetCurrentResourceName()}:execute-call`,Number(t.callingTo))),"answer-call"===e&&(console.log("received answer-call event. attempting to answer the call.."),console.log("event data: ",t),TriggerServerEvent(`${GetCurrentResourceName()}:answer-call`,Number(t.answeredToCaller))),"refuse-call"===e&&(console.log("received refuse-call event. attempting to refuse a call.."),console.log("event data: ",t),TriggerServerEvent(`${GetCurrentResourceName()}:refuse-call`,Number(t.refusedCaller))),"hangup-call"===e&&(console.log("received hangup-call event. attempting to hang up current call.."),TriggerServerEvent(`${GetCurrentResourceName()}:refuse-call`))}showPhoneUI(e,t){SendNuiMessage(JSON.stringify({type:"update",resource:GetCurrentResourceName(),apps:[{icon:"call",text:"Dial",page:"call"},{icon:"contact_page",text:"Contacts",page:"contacts"},{icon:"email",text:"Messages",page:"messages"},{icon:"support",text:"Services",page:"services"}],homescreenWidgets:[{title:"Bank",value:`$${r(Number(this.getPlayerInfo("bank")),1)}`},{title:"Days",value:Number(this.getPlayerInfo("hoursPlayed")).toFixed(1)}],contacts:e.contacts.map((e=>Object.assign(Object.assign({},e),{phone:e.phone.toString()}))),myNumber:e.myNumber,isBeingCalledBy:e.isBeingCalledBy,serviceAgents:e.serviceAgents,shouldStartClosed:!t&&null!=e.isBeingCalledBy}))}registerListeners(){onNet(`${GetCurrentResourceName()}:show-dialog`,(e=>{this.showDialog(e)})),onNet(`${GetCurrentResourceName()}:execute-call`,(e=>{})),onNet(`${GetCurrentResourceName()}:being-called`,(e=>{})),onNet(`${GetCurrentResourceName()}:called-picked-up`,(()=>{console.log("(client.ts:) received called-picked-up event.."),SendNuiMessage(JSON.stringify({type:"conversation-started",data:JSON.stringify({})}))})),onNet(`${GetCurrentResourceName()}:call-ended`,(()=>{console.log("(client.ts:) received call-ended event.."),SendNuiMessage(JSON.stringify({type:"conversation-ended",data:JSON.stringify({})}))}))}showDialog(e){SendNuiMessage(JSON.stringify({type:"opendialog",dialogdata:JSON.stringify(e)}))}registerKeyBindings(){RegisterCommand("+phoneopen",(()=>{TriggerServerEvent(`${GetCurrentResourceName()}:request-use-phone`)}),!1),RegisterKeyMapping("+phoneopen","Use phone","keyboard","l"),RegisterCommand("phone",(()=>{TriggerServerEvent(`${GetCurrentResourceName()}:request-use-phone`)}),!1)}}})()})();