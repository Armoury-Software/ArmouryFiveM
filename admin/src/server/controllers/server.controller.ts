import { ServerController } from '../../../../[utils]/server/server.controller';
import { Skill } from '../../../../skills/src/shared/models/skill.model'

export class Server extends ServerController {
    private createdVehicles: number[] = [];

    public constructor() {
        super();

        this.registerCommands();
    }

    private registerCommands(): void {
        RegisterCommand('veh', (source: number, args: string[], _raw: boolean) => {
            if (!args[0]) {
                console.log('ERROR! You should use /veh <vehiclename> <color>');
                return;
            }

            let model: string = args[0].toString();
            let playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));

            const createdVehicle = CreateVehicle(model, playerPosition[0], playerPosition[1], playerPosition[2], 0, true, true);
            TaskWarpPedIntoVehicle(GetPlayerPed(source), createdVehicle, -1);
            SetVehicleCustomPrimaryColour(createdVehicle, 255, 255, 255);
            SetVehicleCustomSecondaryColour(createdVehicle, 255, 255, 255);
            this.createdVehicles.push(createdVehicle);
        }, false);

        RegisterCommand('destroyvehicles', (_source: number, _args: string[], _raw: boolean) => {
            this.createdVehicles.forEach((createdVehicle: number) => {
                if (DoesEntityExist(createdVehicle)) {
                    DeleteEntity(createdVehicle);
                }
            });

            this.createdVehicles = [];
        }, false);

        RegisterCommand('gotoveh', (source: number, args: number[]) => {
            if (!args.length) {
                return;
            }

            const vehiclePosition: number[] = GetEntityCoords(Number(args[0]));
            SetEntityCoords(GetPlayerPed(source), vehiclePosition[0], vehiclePosition[1], vehiclePosition[2], true, false, false, true);
        }, false);

        RegisterCommand('getveh', (source: number, args: number[]) => {
            if (!args.length) {
                return;
            }

            const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));
            SetEntityCoords(Number(args[0]), playerPosition[0], playerPosition[1] + 1.0, playerPosition[2] + 1.0, true, false, false, true);
        }, false);

        RegisterCommand('stats', (source: number) => {
            console.log('Routing bucket:', GetEntityRoutingBucket(GetPlayerPed(source)));
        }, false);

        this.RegisterAdminCommand('goto', 1 /* TODO: Change if not right */,(source: number, args: string[]) => {
            if (!args.length) {
                console.log('ERROR! You should use /goto <player-name>');
                return;
            }
            
            const players: number[] = global.exports['armoury'].getPlayers()
            let targetPosition: number[];

            players.forEach((player: number) => {
                if (global.exports['authentication'].getPlayerInfo(player, 'name').toLowerCase() === args[0].toLowerCase()) {
                    targetPosition = GetEntityCoords(GetPlayerPed(player), true);
                    SetEntityCoords(GetPlayerPed(source), targetPosition[0]+1, targetPosition[1], targetPosition[2], true, false, false, true);
                }
            })

            if(!targetPosition) {
                console.log(`No player found with name ${args[0]}.`)
                return;
            }

            console.log(`Teleported to ${args[0]}.`);
        }, false);

        this.RegisterAdminCommand('gethere', 1 /* TODO: Change if not right */,(source: number, args: string[]) => {
            if (!args.length) {
                console.log('ERROR! You should use /gethere <player-name>');
                return;
            }
            
            const players: number[] = global.exports['armoury'].getPlayers()
            const targetPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);

            let targetPlayer: number;

            players.forEach((player: number) => {
                if (global.exports['authentication'].getPlayerInfo(player, 'name').toLowerCase() === args[0].toLowerCase()) {
                    targetPlayer = player;
                    SetEntityCoords(GetPlayerPed(player), targetPosition[0]+1, targetPosition[1], targetPosition[2], true, false, false, true);
                }
            })

            if(!targetPlayer) {
                console.log(`No player found with name ${args[0]}`)
                return;
            }

            console.log(`Teleported ${args[0]} to you.`);
        }, false);

        this.RegisterAdminCommand('setstat', 5 /* TODO: Change if not right */,(source: number, args: string[]) => {
            const availableStats: string[] = [
                'cash',
                'skills'
            ];

            if (args.length < 3) {
                console.log('ERROR! You should use /setstat <player-name> <stat> <value>');
                
                console.log(`Stats you can set: ${availableStats.join(', ')}`);
                return;
            }

            const players: number[] = global.exports['armoury'].getPlayers()

            let targetPlayer: number;

            players.forEach((player: number) => {
                if (global.exports['authentication'].getPlayerInfo(player, 'name').toLowerCase() === args[0].toLowerCase()) {
                    targetPlayer = player;
                }
            })

            if(!targetPlayer) {
                console.log(`No player found with name ${args[0]}`)
                return;
            }

            switch (args[1]) {
                case 'cash': {
                    if (Number(args[2])){
                        exports['authentication'].setPlayerInfo(targetPlayer, 'cash', Number(args[2]), false)
                    } else {
                        console.log(`${args[2]} is not a valid amount.`)
                    }
                    return;
                }

                case 'skills': {
                    if(!args[3]){
                        console.log(`Give a value to said skill, using /setstat <player-name> skills <skill> <value>`);
                        return;
                    }
                    
                    global.exports['skills'].updatePlayerSkill(targetPlayer, args[2], args[3])
                    console.log(`Skill ${args[2]} updated successfuly for player ${args[0]} `);
                    
                    return;
                }

                default: {
                    console.log(`No stat with name ${args[1]} found`)
                    return;
                }
            }

        }, false);
    }
}