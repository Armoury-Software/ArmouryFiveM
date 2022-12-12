fx_version 'cerulean'
game 'gta5'

author 'Armoury Development Team'
description 'Armoury FiveM Optimized Custom Vehicles'
version '1.0.0'

client_script 'dist/client/*.client.js'
--server_script 'dist/server/*.server.js'

files {
    'data/**/*.meta'
}

data_file 'HANDLING_FILE' 'data/**/handling.meta'
data_file 'VEHICLE_LAYOUTS_FILE' 'data/**/vehiclelayouts.meta'
data_file 'VEHICLE_METADATA_FILE' 'data/**/vehicles.meta'
data_file 'CARCOLS_FILE' 'data/**/carcols.meta'
data_file 'VEHICLE_VARIATION_FILE' 'data/**/carvariations.meta'
