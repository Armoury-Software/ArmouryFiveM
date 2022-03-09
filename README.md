# ArmouryFiveM

In order to be able to run the server:

1. Clone this repository into your 'resources' folder
2. Add the resources to your server.cfg (all folder names without '[]' inside the 'resources folder):
Example:
```
ensure mapmanager
ensure chat
ensure chat-theme-armoury
ensure spawnmanager
ensure sessionmanager
ensure armoury
ensure armoury-overlay
ensure authentication
ensure admin
ensure hardcap
ensure oxmysql
ensure inventory
ensure trucker-job
ensure houses
ensure houses-menu
ensure businesses
ensure businesses-menu
ensure factions
ensure factions-taxi
ensure bob74_ipl
ensure online-interiors
ensure phone
ensure pma-voice
ensure payday
```
3. Add the following at the bottom of your server.cfg:
```
## MySQL configurations
set mysql_connection_string "user=armouryr_fivem_user;database=armouryr_fivem;host=89.44.138.150;password=a9c4e4ee5555"
set mysql_debug true

set sv_enforceGameBuild 2189
```
4. Send me (Radu) your IP so I can add you to the whitelist for the database
