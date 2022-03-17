import { ServerController } from '../../../../[utils]/server/server.controller';
import { WeaponHash } from 'fivem-js';

export class Server extends ServerController {
  private createdVehicles: number[] = [];

  public constructor() {
    super();

    this.registerCommands();
  }

  private findTargetPlayer(name: string): number {
    const players: number[] = global.exports['armoury'].getPlayers();
    let targetPlayer: number;

    players.forEach((player: number) => {
      if (
        global.exports['authentication']
          .getPlayerInfo(player, 'name')
          .toLowerCase() === name.toLowerCase()
      ) {
        targetPlayer = player;
      }
    });
    return targetPlayer;
  }

  private checkTargetAvailability(targetPlayer: number): boolean {
    if (!targetPlayer) {
      console.log(`No player found with specified name.`);
      return false;
    }
    return true;
  }

  private registerCommands(): void {
    this.RegisterAdminCommand(
      'veh',
      3,
      (source: number, args: string[], _raw: boolean) => {
        if (!args[0]) {
          console.log('ERROR! You should use /veh <vehiclename> <color>');
          return;
        }

        let model: string = args[0].toString();
        let playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));

        const createdVehicle = CreateVehicle(
          model,
          playerPosition[0],
          playerPosition[1],
          playerPosition[2],
          0,
          true,
          true
        );
        TaskWarpPedIntoVehicle(GetPlayerPed(source), createdVehicle, -1);
        SetVehicleCustomPrimaryColour(createdVehicle, 255, 255, 255);
        SetVehicleCustomSecondaryColour(createdVehicle, 255, 255, 255);
        this.createdVehicles.push(createdVehicle);
      },
      false
    );

    this.RegisterAdminCommand(
      'destroyvehicles',
      3,
      (_source: number, _args: string[], _raw: boolean) => {
        this.createdVehicles.forEach((createdVehicle: number) => {
          if (DoesEntityExist(createdVehicle)) {
            DeleteEntity(createdVehicle);
          }
        });

        this.createdVehicles = [];
      },
      false
    );

    RegisterCommand(
      'gotoveh',
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const vehiclePosition: number[] = GetEntityCoords(Number(args[0]));
        SetEntityCoords(
          GetPlayerPed(source),
          vehiclePosition[0],
          vehiclePosition[1],
          vehiclePosition[2],
          true,
          false,
          false,
          true
        );
      },
      false
    );

    RegisterCommand(
      'getveh',
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));
        SetEntityCoords(
          Number(args[0]),
          playerPosition[0],
          playerPosition[1] + 1.0,
          playerPosition[2] + 1.0,
          true,
          false,
          false,
          true
        );
      },
      false
    );

    RegisterCommand(
      'stats',
      (source: number) => {
        console.log(
          'Routing bucket:',
          GetEntityRoutingBucket(GetPlayerPed(source))
        );
      },
      false
    );

    this.RegisterAdminCommand(
      'goto',
      1 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /goto <player-name>');
          return;
        }

        let targetPosition: number[];
        const targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        targetPosition = GetEntityCoords(GetPlayerPed(targetPlayer), true);
        SetEntityCoords(
          GetPlayerPed(source),
          targetPosition[0] + 1,
          targetPosition[1],
          targetPosition[2],
          true,
          false,
          false,
          true
        );

        console.log(`Teleported to ${args[0]}.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'gethere',
      1 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /gethere <player-name>');
          return;
        }

        const targetPosition: number[] = GetEntityCoords(
          GetPlayerPed(source),
          true
        );

        const targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        SetEntityCoords(
          GetPlayerPed(targetPlayer),
          targetPosition[0] + 1,
          targetPosition[1],
          targetPosition[2],
          true,
          false,
          false,
          true
        );

        console.log(`Teleported ${args[0]} to you.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'setstat',
      5 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        const availableStats: string[] = ['skills'];

        if (args.length < 3) {
          console.log(
            'ERROR! You should use /setstat <player-name> <stat> <value>'
          );

          console.log(`Stats you can set: ${availableStats.join(', ')}`);
          return;
        }

        let targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        switch (args[1]) {
          case 'skills': {
            if (!args[3]) {
              console.log(
                `Give a value to said skill, using /setstat <player-name> skills <skill> <value>`
              );
              return;
            }

            if (!Number(args[3])) {
              console.log(`${args[3]} is not a valid value.`);
              return;
            }

            global.exports['skills'].updatePlayerSkill(
              targetPlayer,
              args[2],
              args[3]
            );
            console.log(
              `Skill ${args[2]} updated successfuly for player ${args[0]} `
            );

            return;
          }

          default: {
            console.log(`No stat with name ${args[1]} found`);
            return;
          }
        }
      },
      false
    );

    this.RegisterAdminCommand(
      'setcash',
      5 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (args.length < 2) {
          console.log('ERROR! You should use /setcash <player-name> <value>');
          return;
        }

        let targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        if (!Number(args[1])) {
          console.log(`${args[1]} is not a valid value`);
          return;
        }

        exports['authentication'].setPlayerInfo(
          targetPlayer,
          'cash',
          Number(args[1]),
          false
        );
        console.log(`${args[0]}'s cash was set to ${args[1]}$.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'givecash',
      5 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (args.length < 2) {
          console.log('ERROR! You should use /givecash <player-name> <value>');
          return;
        }

        const targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        if (!Number(args[1])) {
          console.log(`${args[1]} is not a valid value.`);
          return;
        }

        const playerCash: number = exports['authentication'].getPlayerInfo(
          targetPlayer,
          'cash'
        );

        exports['authentication'].setPlayerInfo(
          targetPlayer,
          'cash',
          Number(args[1]) + playerCash,
          false
        );
        console.log(`${args[0]} received ${args[1]}$.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'setadmin',
      6,
      (args: string[]) => {
        if (!args[0]) {
          console.log('Error! Use /setadmin <player-name> <admin-level>');
          return;
        }

        let targetPlayer: number = this.findTargetPlayer(args[0]);

        if (this.checkTargetAvailability(targetPlayer)) {
          return;
        }
        global.exports['authentication'].setPlayerInfo(
          source,
          'adminLevel',
          args[0]
        );
      },
      false
    );

    this.RegisterAdminCommand(
      'giveweapon',
      3 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (args.length < 3) {
          console.log(
            'ERROR! You should use /giveweapon <player-name> <weapon-name> <no-of-bullets>'
          );
          return;
        }
        const targetPlayer: number = this.findTargetPlayer(args[0]);
        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        if (!Number(args[2])) {
          console.log(`${args[2]} is not a valid value.`);
          return;
        }

        const weapon: string = WeaponHash[args[1]] ? WeaponHash[args[1]] : '';

        if (!weapon) {
          console.log(`Weapon ${args[1]} not found.`);
          return;
        }

        global.exports['weapons'].givePlayerWeapon(
          targetPlayer,
          WeaponHash[args[1]],
          Number(args[2])
        );
        console.log(
          `Succesfuly gave ${args[0]} the following weapon: ${args[1]}.`
        );
      },
      false
    );

    this.RegisterAdminCommand(
      'removeweapons',
      2 /* TODO: Change if not right */,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /removeweapons <player-name>');
          return;
        }

        const targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        global.exports['weapons'].removePlayerWeapons(targetPlayer);
        console.log(`Succesfully removed ${args[0]}'s weapons.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'testc',
      1,
      (source: number, args: string[]) => {
        console.log(GetWeaponClipSize('MG'));
        console.log(GetWeaponClipSize(WeaponHash.MG));
      },
      false
    );
  }
}
