import { Controller, Command, EventListener, ServerController } from '@armoury/fivem-framework';

import { TELEPORT_POINTS } from '@shared/teleport-locations';

@Controller()
export class Server extends ServerController {
  private createdVehicles: number[] = [];

  @Command({ adminLevelRequired: 1 })
  public tp(source: number, locationOrPosX: string | number, posY: number, posZ: number) {
    if (!locationOrPosX) {
      console.log('Error! Use /tp <location>.');
      return;
    }

    if (TELEPORT_POINTS[locationOrPosX]) {
      Cfx.Server.SetEntityCoords(
        Cfx.Server.GetPlayerPed(source.toString()),
        TELEPORT_POINTS[locationOrPosX].pos[0],
        TELEPORT_POINTS[locationOrPosX].pos[1],
        TELEPORT_POINTS[locationOrPosX].pos[2],
        true,
        false,
        false,
        false
      );
    } else if (Number(locationOrPosX) && Number(posY) && Number(posZ)) {
      Cfx.Server.SetEntityCoords(
        Cfx.Server.GetPlayerPed(source.toString()),
        Number(locationOrPosX),
        Number(posY),
        Number(posZ),
        true,
        false,
        false,
        false
      );

      console.log(source, `${Cfx.Server.GetCurrentResourceName()}:send-updated-position`);

      Cfx.Server.TriggerClientEvent(
        `${Cfx.Server.GetCurrentResourceName()}:send-updated-position`,
        source,
        locationOrPosX,
        posY,
        posZ
      );
    } else {
      console.log(`No teleport with name ${locationOrPosX}`);
    }
  }

  @Command({ adminLevelRequired: 3 })
  public veh(source: number, model: string, color: number) {
    if (!model) {
      console.log('ERROR! You should use /veh <vehiclename> <color>');
      return;
    }

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
  }

  @Command({ adminLevelRequired: 3 })
  public destroyVehicles() {
    this.createdVehicles.forEach((createdVehicle: number) => {
      if (Cfx.Server.DoesEntityExist(createdVehicle)) {
        Cfx.Server.DeleteEntity(createdVehicle);
      }
    });

    this.createdVehicles = [];
  }

  @Command({ adminLevelRequired: 3 })
  public goToVeh(source: number, vehicleId: number) {
    if (!vehicleId) {
      return;
    }

    const vehiclePosition: number[] = Cfx.Server.GetEntityCoords(vehicleId);
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
  }

  @Command({ adminLevelRequired: 3 })
  public getVeh(source: number, vehicleId: number) {
    if (!vehicleId) {
      return;
    }

    const playerPosition: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(source.toString()));
    Cfx.Server.SetEntityCoords(
      vehicleId,
      playerPosition[0],
      playerPosition[1] + 1.0,
      playerPosition[2] + 1.0,
      true,
      false,
      false,
      true
    );
  }

  @Command({ adminLevelRequired: 1 })
  public aSetRoutingBucket(source: number, targetPlayer: number, routingBucket: number) {
    if (!targetPlayer && !routingBucket) {
      console.log('ERROR! You should use /aSetroutingbucket <player-name> <routingBucket>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    Cfx.Server.SetEntityRoutingBucket(Cfx.Server.GetPlayerPed(targetPlayer.toString()), routingBucket);
  }

  @Command({ adminLevelRequired: 1 })
  public goTo(source: number, targetPlayer: number) {
    if (!targetPlayer) {
      console.log('ERROR! You should use /goto <player-id>');
      return;
    }

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

    console.log(`Teleported to ${targetPlayer}.`);
  }

  @Command({ adminLevelRequired: 2 })
  public getHere(source: number, targetPlayer: number) {
    if (!targetPlayer) {
      console.log('ERROR! You should use /gethere <player-id>');
      return;
    }

    const targetPosition: number[] = Cfx.Server.GetEntityCoords(
      Cfx.Server.GetPlayerPed(source.toString()) /*,
      true*/
    );

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

    console.log(`Teleported ${targetPlayer} to you.`);
  }

  @Command({ adminLevelRequired: 5 })
  public setStat(source: number, targetPlayer: number, stat: string, value: any) {
    const availableStats: string[] = ['skills'];

    if (targetPlayer == null || !stat || value == null) {
      console.log('ERROR! You should use /setstat <player-id> <stat> <value>');
      console.log(`Stats you can set: ${availableStats.join(', ')}`);
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    switch (stat) {
      case 'skills': {
        if (!value) {
          console.log(`Give a value to said skill, using /setstat <player-name> skills <skill> <value>`);
          return;
        }

        if (!Number(value)) {
          console.log(`${value} is not a valid value.`);
          return;
        }

        Cfx.exports['skills'].updatePlayerSkill(targetPlayer, stat, value);
        console.log(`Skill ${stat} updated successfuly for player ${targetPlayer} `);

        return;
      }

      default: {
        console.log(`No stat with name ${stat} found`);
        return;
      }
    }
  }

  @Command({ adminLevelRequired: 5 })
  public setCash(source: number, targetPlayer: number, cash: number) {
    if (targetPlayer == null || cash == null) {
      console.log('ERROR! You should use /setcash <player-name> <value>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    if (Number.isNaN(Number(cash))) {
      console.log(`${cash} is not a valid value`);
      return;
    }

    exports['authentication'].setPlayerInfo(targetPlayer, 'cash', cash, false);
    console.log(`${targetPlayer}'s cash was set to ${cash}$.`);
  }

  @Command({ adminLevelRequired: 5 })
  public giveCash(source: number, targetPlayer: number, cash: number) {
    if (targetPlayer == null || Number.isNaN(Number(cash))) {
      console.log('ERROR! You should use /givecash <player-name> <value>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    const playerCash: number = exports['authentication'].getPlayerInfo(targetPlayer, 'cash');

    exports['authentication'].setPlayerInfo(targetPlayer, 'cash', Number(cash) + playerCash, false);
    console.log(`${targetPlayer} received ${cash}$.`);
  }

  @Command({ adminLevelRequired: 4 })
  public giveWeapon(source: number, targetPlayer: number, weapon: number, ammo: number) {
    if (targetPlayer == null || Number.isNaN(Number(weapon)) || Number.isNaN(Number(ammo))) {
      console.log('ERROR! You should use /giveweapons <player-id> <weapon-name> <ammo>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
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
  }

  @Command({ adminLevelRequired: 3 })
  public removeWeapons(source: number, targetPlayer: number) {
    if (targetPlayer == null) {
      console.log('ERROR! You should use /removeweapons <player-id>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    Cfx.exports['weapons'].removePlayerWeapons(targetPlayer);
    console.log(`Succesfully removed ${targetPlayer}'s weapons.`);
  }

  @Command({ adminLevelRequired: 5 })
  public aGiveDrugs(source: number, targetPlayer: number, drugType: string, amount: number) {
    if (targetPlayer == null || !drugType || Number.isNaN(Number(amount))) {
      console.log('Error! Use /agivedrugs <target> <drug-type> <amount>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    if (Cfx.exports['drugs'].verifyDrugType(drugType)) {
      Cfx.exports['drugs'].givePlayerDrugs(targetPlayer, drugType, amount);
      console.log(`Succesfully gave ${targetPlayer} ${amount}g of ${drugType}.`);
    } else {
      console.log(`Invalid drug type (${drugType}). Types: cocaine/marijuana`);
    }
  }

  @Command({ adminLevelRequired: 5 })
  public aRemoveDrugs(source: number, targetPlayer: number, drugType: string, amount: number) {
    if (targetPlayer == null || !drugType || Number.isNaN(Number(amount))) {
      console.log('Error! Use /aremovedrugs <target> <drug-type> <amount?>');
      return;
    }

    if (!Cfx.exports['armoury'].isPlayerOnline(targetPlayer)) {
      return;
    }

    if (Cfx.exports['drugs'].verifyDrugType(drugType)) {
      Cfx.exports['drugs'].removePlayerDrugs(targetPlayer, drugType, amount);
    } else {
      console.log(`Invalid drug type (${drugType}). Types: cocaine/marijuana`);
    }
  }

  @Command()
  public stats(source: number) {
    console.log('Routing bucket:', Cfx.Server.GetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString())));
  }

  @EventListener({
    eventName: `${Cfx.Server.GetCurrentResourceName()}:open-admin-menu`,
  })
  public onAdminMenuOpen(data: any) {
    Cfx.exports['armoury-overlay'].showContextMenu(Cfx.source, data);
  }
}
