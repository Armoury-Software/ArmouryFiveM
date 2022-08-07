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
ensure carrier-job
ensure houses
ensure houses-menu
ensure human-needs
ensure businesses
ensure businesses-247
ensure businesses-menu
ensure factions
ensure factions-police
ensure factions-taxi
ensure bob74_ipl
ensure online-interiors
ensure phone
ensure pma-voice
ensure payday
ensure skills
ensure banking
ensure weapons
ensure vehicles
ensure trunk
ensure general-context-menu
ensure custom-vehicles
ensure dealership
ensure drugs
ensure experience
ensure pets

## Maps
ensure vinewoodfloorMain
ensure vinewoodfloorLSPD
ensure vinewoodfloorStairs
ensure vinewoodfloorGarage
ensure vinewoodfloorUG

set sv_enforceGameBuild 2189
```
3. Use the .sql file provided at the root of the repository in order to initialize your database table structure
4. Set up your MySQL connectivity by adding the following configurations inside your server.cfg:
```
## MySQL configurations
set mysql_connection_string "user=<user>;database=<db>;host=<host>;password=<password>"
set mysql_debug true
```
5. We advise you to also install and activate bob74_ipl resource, as the server is highly based on it.
6. Boot up the server. Everything should be working fine now!
