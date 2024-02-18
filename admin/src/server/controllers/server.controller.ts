import { EventListener, ServerController } from '@armoury/fivem-framework';

import { TELEPORT_POINTS } from '@shared/teleport-locations';

export class Server extends ServerController {
  private createdVehicles: number[] = [];

  public constructor() {
    super();

    this.registerCommands();
  }

  private registerCommands(): void {
    this.RegisterAdminCommand(
      'tp',
      1,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('Error! Use /tp <location>.');
          return;
        }

        if (TELEPORT_POINTS[args[0]]) {
          Cfx.Server.SetEntityCoords(
            Cfx.Server.GetPlayerPed(source.toString()),
            TELEPORT_POINTS[args[0]].pos[0],
            TELEPORT_POINTS[args[0]].pos[1],
            TELEPORT_POINTS[args[0]].pos[2],
            true,
            false,
            false,
            false
          );
        } else if (Number(args[0]) && Number(args[1]) && Number(args[2])) {
          Cfx.Server.SetEntityCoords(
            Cfx.Server.GetPlayerPed(source.toString()),
            Number(args[0]),
            Number(args[1]),
            Number(args[2]),
            true,
            false,
            false,
            false
          );
          setTimeout(() => {}, 800);
          Cfx.Server.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:send-updated-position`, source, args);
        } else {
          console.log(`No teleport with name ${args[0]}`);
        }
      },
      false
    );

    this.RegisterAdminCommand(
      'veh',
      3,
      (source: number, args: string[], _raw: boolean) => {
        if (!args[0]) {
          console.log('ERROR! You should use /veh <vehiclename> <color>');
          return;
        }

        const model: string = args[0].toString();
        const playerPosition: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(source.toString()));

        const createdVehicle: number = Cfx.Server.CreateVehicle(
          model,
          playerPosition[0],
          playerPosition[1],
          playerPosition[2],
          0,
          true,
          true
        );
        Cfx.Server.TaskWarpPedIntoVehicle(Cfx.Server.GetPlayerPed(source.toString()), createdVehicle, -1);
        Cfx.Server.SetVehicleCustomPrimaryColour(createdVehicle, 0, 0, 0);
        Cfx.Server.SetVehicleCustomSecondaryColour(createdVehicle, 0, 0, 0);
        this.createdVehicles.push(createdVehicle);
      },
      false
    );

    this.RegisterAdminCommand(
      'destroyvehicles',
      3,
      (_source: number, _args: string[], _raw: boolean) => {
        this.createdVehicles.forEach((createdVehicle: number) => {
          if (Cfx.Server.DoesEntityExist(createdVehicle)) {
            Cfx.Server.DeleteEntity(createdVehicle);
          }
        });

        this.createdVehicles = [];
      },
      false
    );

    this.RegisterAdminCommand(
      'gotoveh',
      3,
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const vehiclePosition: number[] = Cfx.Server.GetEntityCoords(Number(args[0]));
        Cfx.Server.SetEntityCoords(
          Cfx.Server.GetPlayerPed(source.toString()),
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

    this.RegisterAdminCommand(
      'getveh',
      3,
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const playerPosition: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(source.toString()));
        Cfx.Server.SetEntityCoords(
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

    this.RegisterAdminCommand(
      'setroutingbucket',
      1,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /setroutingbucket <player-name> <routingBucket>');
          return;
        }

        const targetPlayer: number = Number(args[0]);
        const routingBucket: number = Number(args[1]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        Cfx.Server.SetEntityRoutingBucket(Cfx.Server.GetPlayerPed(targetPlayer.toString()), routingBucket);

        console.log(`Teleported to ${args[0]}.`);
      },
      false
    );

    Cfx.Server.RegisterCommand(
      'stats',
      (source: number) => {
        console.log('Routing bucket:', Cfx.Server.GetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString())));
      },
      false
    );

    this.RegisterAdminCommand(
      'goto',
      1,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /goto <player-name>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        const targetPosition: number[] = Cfx.Server.GetEntityCoords(
          Cfx.Server.GetPlayerPed(targetPlayer.toString()) /*,
          true*/
        );
        Cfx.Server.SetEntityCoords(
          Cfx.Server.GetPlayerPed(source.toString()),
          targetPosition[0] + 1,
          targetPosition[1],
          targetPosition[2],
          true,
          false,
          false,
          true
        );
        Cfx.Server.SetEntityRoutingBucket(
          Cfx.Server.GetPlayerPed(source.toString()),
          Cfx.Server.GetEntityRoutingBucket(Cfx.Server.GetPlayerPed(targetPlayer.toString()))
        );

        console.log(`Teleported to ${args[0]}.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'gethere',
      2,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /gethere <player-name>');
          return;
        }

        const targetPosition: number[] = Cfx.Server.GetEntityCoords(
          Cfx.Server.GetPlayerPed(source.toString()) /*,
          true*/
        );

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        Cfx.Server.SetEntityCoords(
          Cfx.Server.GetPlayerPed(targetPlayer.toString()),
          targetPosition[0] + 1,
          targetPosition[1],
          targetPosition[2],
          true,
          false,
          false,
          true
        );

        Cfx.Server.SetEntityRoutingBucket(
          Cfx.Server.GetPlayerPed(targetPlayer.toString()),
          Cfx.Server.GetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString()))
        );

        console.log(`Teleported ${args[0]} to you.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'setstat',
      5,
      (source: number, args: string[]) => {
        const availableStats: string[] = ['skills'];

        if (args.length < 3) {
          console.log('ERROR! You should use /setstat <player-name> <stat> <value>');

          console.log(`Stats you can set: ${availableStats.join(', ')}`);
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        switch (args[1]) {
          case 'skills': {
            if (!args[3]) {
              console.log(`Give a value to said skill, using /setstat <player-name> skills <skill> <value>`);
              return;
            }

            if (!Number(args[3])) {
              console.log(`${args[3]} is not a valid value.`);
              return;
            }

            Cfx.exports['skills'].updatePlayerSkill(targetPlayer, args[2], args[3]);
            console.log(`Skill ${args[2]} updated successfuly for player ${args[0]} `);

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
      5,
      (source: number, args: string[]) => {
        if (args.length < 2) {
          console.log('ERROR! You should use /setcash <player-name> <value>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        if (!Number(args[1])) {
          console.log(`${args[1]} is not a valid value`);
          return;
        }

        exports['authentication'].setPlayerInfo(targetPlayer, 'cash', Number(args[1]), false);
        console.log(`${args[0]}'s cash was set to ${args[1]}$.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'givecash',
      5,
      (source: number, args: string[]) => {
        if (args.length < 2) {
          console.log('ERROR! You should use /givecash <player-name> <value>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        if (!Number(args[1])) {
          console.log(`${args[1]} is not a valid value.`);
          return;
        }

        const playerCash: number = exports['authentication'].getPlayerInfo(targetPlayer, 'cash');

        exports['authentication'].setPlayerInfo(targetPlayer, 'cash', Number(args[1]) + playerCash, false);
        console.log(`${args[0]} received ${args[1]}$.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'giveweapon',
      4,
      (source: number, args: string[]) => {
        if (args.length < 3) {
          console.log('ERROR! You should use /giveweapons <player-name> <weapon-name> <no-of-bullets>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        if (!Number(args[2])) {
          console.log(`${args[2]} is not a valid value.`);
          return;
        }

        throw new Error('Not implemented');

        /*const weapon: string = WeaponHash[args[1]] ? WeaponHash[args[1]] : '';
        
                if (!weapon) {
                  console.log(`Weapon ${args[1]} not found.`);
                  return;
                }
        
                Cfx.exports['weapons'].givePlayerWeapon(
                  targetPlayer,
                  WeaponHash[args[1]],
                  Number(args[2])
                );
                console.log(
                  `Succesfuly gave ${args[0]} the following weapon: ${args[1]}.`
                );*/
      },
      false
    );

    this.RegisterAdminCommand(
      'removeweapons',
      3,
      (source: number, args: string[]) => {
        if (!args.length) {
          console.log('ERROR! You should use /removeweapons <player-name>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        Cfx.exports['weapons'].removePlayerWeapons(targetPlayer);
        console.log(`Succesfully removed ${args[0]}'s weapons.`);
      },
      false
    );

    this.RegisterAdminCommand(
      'agivedrugs',
      5,
      (source: number, args: string[]) => {
        if (args.length < 3) {
          console.log('Error! Use /agivedrugs <target> <drug-type> <amount>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        if (!Number(args[2])) {
          console.log(`${args[2]} is not a valid value.`);
          return;
        }

        if (Cfx.exports['drugs'].verifyDrugType(args[1])) {
          Cfx.exports['drugs'].givePlayerDrugs(targetPlayer, args[1], Number(args[2]));
          console.log(`Succesfully gave ${args[0]} ${args[2]}g of ${args[1]}.`);
        } else {
          console.log(`Invalid drug type (${args[1]}). Types: cocaine/marijuana`);
        }
      },
      false
    );

    this.RegisterAdminCommand(
      'aremovedrugs',
      5,
      (source: number, args: string[]) => {
        if (args.length < 2) {
          console.log('Error! Use /aremovedrugs <target> <drug-type> <amount?>');
          return;
        }

        const targetPlayer: number = Number(args[0]);

        if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
          return;
        }

        if (Cfx.exports['drugs'].verifyDrugType(args[1])) {
          Cfx.exports['drugs'].removePlayerDrugs(targetPlayer, args[1], Number(args[2]));
        } else {
          console.log(`Invalid drug type (${args[1]}). Types: cocaine/marijuana`);
        }
      },
      false
    );
  }

  @EventListener({
    eventName: `${Cfx.Server.GetCurrentResourceName()}:open-admin-menu`,
  })
  public onAdminMenuOpen(data: any) {
    Cfx.exports['armoury-overlay'].showContextMenu(Cfx.source, data);
  }
}
