fx_version 'cerulean'
game 'gta5'

author 'Armoury Development Team'
description 'Armoury FiveM Overlay'
version '1.0.1'

server_script 'dist/server/*.server.js'
client_script 'dist/client/*.client.js'

ui_page 'dist/ui/index.html'
files {
    'dist/ui/index.html',
    'dist/ui/*.js',
    'dist/ui/*.css',
    'dist/ui/assets/*.png',
    'dist/ui/**/*.otf'
}
