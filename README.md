## Documentation: https://github.com/Armoury-Software/ArmouryFiveM/wiki/Armoury-Framework-Documentation

## Quick start:

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
ensure character-creation
ensure houses
ensure houses-menu
ensure human-needs
ensure businesses
ensure businesses-247
ensure businesses-menu
ensure factions
ensure factions-police
ensure factions-taxi
ensure factions-tcc
ensure factions-activity
ensure factions-logs
ensure bob74_ipl
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

set sv_enforceGameBuild 2189
```
3. Make sure all the resources listed above are up and running before starting your server! (Some might be external, default ones!)
4. Use the .sql file provided at the root of the repository in order to initialize your database table structure
5. Set up your MySQL connectivity by adding the following configurations inside your server.cfg:
```
## MySQL configurations
set mysql_connection_string "user=<user>;database=<db>;host=<host>;password=<password>"
set mysql_debug true
```
6. We advise you to also install and activate bob74_ipl resource, as the server is highly based on it.
7. Boot up the server. Everything should be working fine now!
