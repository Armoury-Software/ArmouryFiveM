fx_version 'cerulean'
game 'gta5'

author 'Armoury Development Team'
description 'Armoury FiveM Gamemode'
version '1.0.1'

resource_type 'gametype' { name = 'Armoury Light Roleplay' }

client_scripts {
    'dist/client/*.client.js',
    'dist/lua/*.client.lua'
}
server_script 'dist/server/*.server.js'

loadscreen 'dist/ui/loading.html'
file 'dist/ui/loading.html'
