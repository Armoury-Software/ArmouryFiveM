(()=>{const a=[247.83297729492188,-343.20001220703125,44.4615478515625,0,0,158.7401580810547];on("onClientGameTypeStart",(()=>{globalThis.exports.spawnmanager.setAutoSpawnCallback((()=>{globalThis.exports.spawnmanager.spawnPlayer({x:a[0],y:a[1],z:a[2],model:"a_m_m_skater_01"},(()=>{emit("chat:addMessage",{args:["Welcome to the party!~"]}),SetEntityRotation(GetPlayerPed(-1),a[3],a[4],a[5],2,!0)}))})),globalThis.exports.spawnmanager.setAutoSpawn(!0),globalThis.exports.spawnmanager.forceRespawn()}))})();