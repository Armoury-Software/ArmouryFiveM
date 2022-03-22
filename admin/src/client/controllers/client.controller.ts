import { ClientController } from '@core/client';
import { EventListener, EVENT_DIRECTIONS } from '@core/decorators';
import { Delay } from '@core/utils';

import { TELEPORT_POINTS } from '@shared/teleport-locations';
import {
  ADMIN_ENTITIES,
  ADMIN_GIVE_DRUGS,
  ADMIN_GIVE_MONEY,
  ADMIN_GIVE_SELF,
  ADMIN_GIVE_WEAPON,
  ADMIN_MENU_MAIN,
  ADMIN_TELEPORT,
  ADMIN_VEHICLES,
} from '@shared/models/admin-menu';

import { WEAPON_NAMES } from '../../../../weapons/src/shared/weapon';

export class Client extends ClientController {
  private menuToggles: Map<string, boolean> = new Map<string, boolean>();

  public constructor() {
    super();

    this.assignCommands();
    this.registerKeyBindings();
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+openadminmenu',
      () => {
        if (this.getPlayerInfo('adminLevel') > 0) {
          if (this.menuToggles.get('admin-menu') === true) {
            this.menuToggles.set('admin-menu', false);
            emit('armoury-overlay:hide-context-menu');
            return;
          }

          TriggerServerEvent(
            `${GetCurrentResourceName()}:open-admin-menu`,
            ADMIN_MENU_MAIN
          );
          console.log('opening admin menu');
          this.menuToggles.set('admin-menu', true);
        }
      },
      false
    );

    RegisterKeyMapping('+openadminmenu', 'Open Admin Menu', 'keyboard', 'f1');
  }

  @EventListener({
    eventName: 'armoury-overlay:context-menu-item-pressed',
    direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT,
  })
  public onContextMenuItemPressed(data: any) {
    switch (data.menuId) {
      case 'admin-menu':
        switch (data.buttonSelected.label.toLowerCase()) {
          case 'give self':
            TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_GIVE_SELF,
              items: ADMIN_GIVE_SELF.items.filter((item) => {
                return (
                  Number(item.adminLevel) <= this.getPlayerInfo('adminLevel')
                );
              }),
            });
            break;
          case 'teleports':
            let teleportPoints = ['waypoint'];
            for (let teleportPoint in TELEPORT_POINTS) {
              teleportPoints.push(teleportPoint);
            }
            TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_TELEPORT,
              items: teleportPoints
                .map((teleport, index) => ({
                  label: teleport,
                  active: !index ? true : false,
                  adminLevel: 1,
                }))
                .filter((item) => {
                  return (
                    Number(item.adminLevel) <= this.getPlayerInfo('adminLevel')
                  );
                }),
            });

            break;
          case 'player administration':
            // TODO
            break;
          case 'remove entities':
            TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_ENTITIES,
              items: ADMIN_ENTITIES.items
                .filter(
                  (item) =>
                    Number(item.adminLevel) <=
                    Number(this.getPlayerInfo('adminLevel'))
                )
                .map((item, _index, thisArray) =>
                  thisArray.length === 1 ? { ...item, active: true } : item
                ),
            });
            break;
        }
        break;
      case 'give-self-menu':
        switch (data.buttonSelected.label.toLowerCase()) {
          case 'give weapon':
            let weaponNames = [];
            for (let weapon in WEAPON_NAMES) {
              weaponNames.push(WEAPON_NAMES[weapon]);
            }
            TriggerServerEvent(`${GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_GIVE_WEAPON,
              items: weaponNames.map((weapon, index) => ({
                label: weapon,
                active: !index ? true : false,
              })),
            });
            break;
          case 'give drugs':
            TriggerServerEvent(
              `${GetCurrentResourceName()}:open-admin-menu`,
              ADMIN_GIVE_DRUGS
            );
            break;
          case 'give money':
            TriggerServerEvent(
              `${GetCurrentResourceName()}:open-admin-menu`,
              ADMIN_GIVE_MONEY
            );
            break;
          case 'give vehicle':
            TriggerServerEvent(
              `${GetCurrentResourceName()}:open-admin-menu`,
              ADMIN_VEHICLES
            );
            break;
        }
      case 'give-weapon':
        if (
          data.buttonSelected.label.toLowerCase() !== 'give weapon' &&
          data.buttonSelected.label.toLowerCase() !== 'give drugs' &&
          data.buttonSelected.label.toLowerCase() !== 'give money' &&
          data.buttonSelected.label.toLowerCase() !== 'give vehicle'
        ) {
          ExecuteCommand(
            `giveweapon ${<string>(
              this.getPlayerInfo('name')
            )} ${data.buttonSelected.label.replaceAll(' ', '')} 150`
          );
        }
        break;
      case 'give-drugs':
        ExecuteCommand(
          `agivedrugs ${<string>this.getPlayerInfo('name')} ${
            data.buttonSelected.label
          } 10`
        );
        break;
      case 'give-money':
        if (data.buttonSelected.label.toLowerCase !== 'give money') {
          ExecuteCommand(
            `givecash ${<string>(
              this.getPlayerInfo('name')
            )} ${data.buttonSelected.label.replaceAll('$', '')}`
          );
        }
        break;
      case 'teleportation':
        if (data.buttonSelected.label.toLowerCase() !== 'teleportation') {
          if (data.buttonSelected.label.toLowerCase() === 'waypoint') {
            const blip: number = GetFirstBlipInfoId(8);

            if (blip != 0) {
              const coord = GetBlipCoords(blip);
              if (coord) {
                ExecuteCommand(`tp ${coord[0]} ${coord[1]} ${coord[2]}`);
              } else {
                console.log('Please put a waypoint before using the command.');
              }
            }
          } else {
            ExecuteCommand(`tp ${data.buttonSelected.label.toLowerCase()}`);
          }
        }
        break;
      case 'veh-spawn':
        if (data.buttonSelected.label.toLowerCase() !== 'give vehicle') {
          ExecuteCommand(`veh ${data.buttonSelected.label}`);
        }
        break;
      case 'remove-entities':
        if (data.buttonSelected.label.toLowerCase() !== 'remove entities') {
          if (data.buttonSelected.label === 'Vehicles') {
            ExecuteCommand(`destroy${data.buttonSelected.label.toLowerCase()}`);
          } else {
            ExecuteCommand(`remove${data.buttonSelected.label.toLowerCase()}`);
          }
        }
        break;
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:send-updated-position`,
  })
  public onAfterTeleport(args: string[]) {
    let zCoord: [boolean, number, number[]] = GetGroundZAndNormalFor_3dCoord(
      Number(args[0]),
      Number(args[1]),
      Number(args[2])
    );
    console.log(zCoord + ' ' + source + ' ' + args.join(', '));
    if (GetEntityCoords(GetPlayerPed(source))[2] < zCoord[1]) {
      SetEntityCoords(
        GetPlayerPed(source),
        Number(args[0]),
        Number(args[1]),
        Number(zCoord),
        true,
        false,
        false,
        false
      );
    }
  }

  private assignCommands(): void {
    // TODO: REMOVE FOLLOWING !!!
    setTick(async () => {
      NetworkOverrideClockTime(12, 0, 0);
      await Delay(10000);
    });
  }
}
