import { Inject } from 'injection-js';
import {
  ClientSessionService,
  Command,
  KeyBinding,
  EVENT_DIRECTIONS,
  EventListener,
  Controller,
} from '@armoury/fivem-framework';

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

@Controller()
export class Client {
  private menuToggles: Map<string, boolean> = new Map<string, boolean>();

  public constructor(
    // TODO: Migrate ClientSessionService to @armoury/fivem-gamemode
    @Inject(ClientSessionService) private _session: ClientSessionService
  ) {}

  @Command()
  @KeyBinding({ description: 'Open Admin Menu', defaultMapper: 'keyboard', key: 'f1' })
  public openAdminMenu() {
    if (<number>this._session.getPlayerInfo('adminLevel') > 0) {
      if (this.menuToggles.get('admin-menu') === true) {
        this.menuToggles.set('admin-menu', false);
        Cfx.Client.emit('armoury-overlay:hide-context-menu');
        return;
      }

      Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, ADMIN_MENU_MAIN);
      this.menuToggles.set('admin-menu', true);
    } else {
      console.log('Insufficient admin level!');
    }
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
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_GIVE_SELF,
              items: ADMIN_GIVE_SELF.items.filter((item) => {
                return Number(item.adminLevel) <= <number>this._session.getPlayerInfo('adminLevel');
              }),
            });
            break;
          case 'teleports':
            let teleportPoints = ['waypoint'];
            for (let teleportPoint in TELEPORT_POINTS) {
              teleportPoints.push(teleportPoint);
            }
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_TELEPORT,
              items: teleportPoints
                .map((teleport, index) => ({
                  label: teleport,
                  active: !index ? true : false,
                  adminLevel: 1,
                }))
                .filter((item) => {
                  return Number(item.adminLevel) <= <number>this._session.getPlayerInfo('adminLevel');
                }),
            });

            break;
          case 'player administration':
            // TODO
            break;
          case 'remove entities':
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_ENTITIES,
              items: ADMIN_ENTITIES.items
                .filter((item) => Number(item.adminLevel) <= Number(this._session.getPlayerInfo('adminLevel')))
                .map((item, _index, thisArray) => (thisArray.length === 1 ? { ...item, active: true } : item)),
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
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, {
              ...ADMIN_GIVE_WEAPON,
              items: weaponNames.map((weapon, index) => ({
                label: weapon,
                active: !index ? true : false,
              })),
            });
            break;
          case 'give drugs':
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, ADMIN_GIVE_DRUGS);
            break;
          case 'give money':
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, ADMIN_GIVE_MONEY);
            break;
          case 'give vehicle':
            Cfx.Client.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:open-admin-menu`, ADMIN_VEHICLES);
            break;
        }
      case 'give-weapon':
        if (
          data.buttonSelected.label.toLowerCase() !== 'give weapon' &&
          data.buttonSelected.label.toLowerCase() !== 'give drugs' &&
          data.buttonSelected.label.toLowerCase() !== 'give money' &&
          data.buttonSelected.label.toLowerCase() !== 'give vehicle'
        ) {
          Cfx.Client.ExecuteCommand(
            `giveweapon ${<string>this._session.getPlayerInfo('name')} ${data.buttonSelected.label.replaceAll(
              ' ',
              ''
            )} 150`
          );
        }
        break;
      case 'give-drugs':
        Cfx.Client.ExecuteCommand(
          `agivedrugs ${<string>this._session.getPlayerInfo('name')} ${data.buttonSelected.label} 10`
        );
        break;
      case 'give-money':
        if (data.buttonSelected.label.toLowerCase !== 'give money') {
          Cfx.Client.ExecuteCommand(
            `givecash ${<string>this._session.getPlayerInfo('name')} ${data.buttonSelected.label.replaceAll('$', '')}`
          );
        }
        break;
      case 'teleportation':
        if (data.buttonSelected.label.toLowerCase() !== 'teleportation') {
          if (data.buttonSelected.label.toLowerCase() === 'waypoint') {
            const blip: number = Cfx.Client.GetFirstBlipInfoId(8);

            if (blip != 0) {
              const coord = Cfx.Client.GetBlipCoords(blip);
              if (coord) {
                Cfx.Client.ExecuteCommand(`tp ${coord[0]} ${coord[1]} ${coord[2]}`);
              } else {
                console.log('Please put a waypoint before using the command.');
              }
            }
          } else {
            Cfx.Client.ExecuteCommand(`tp ${data.buttonSelected.label.toLowerCase()}`);
          }
        }
        break;
      case 'veh-spawn':
        if (data.buttonSelected.label.toLowerCase() !== 'give vehicle') {
          Cfx.Client.ExecuteCommand(`veh ${data.buttonSelected.label}`);
        }
        break;
      case 'remove-entities':
        if (data.buttonSelected.label.toLowerCase() !== 'remove entities') {
          if (data.buttonSelected.label === 'Vehicles') {
            Cfx.Client.ExecuteCommand(`destroy${data.buttonSelected.label.toLowerCase()}`);
          } else {
            Cfx.Client.ExecuteCommand(`remove${data.buttonSelected.label.toLowerCase()}`);
          }
        }
        break;
    }
  }

  @EventListener({
    eventName: `${Cfx.Client.GetCurrentResourceName()}:send-updated-position`,
  })
  public onAfterTeleport(posX: number, posY: number, posZ: number) {
    let zCoord: [boolean, number, number[]] = Cfx.Client.GetGroundZAndNormalFor_3dCoord(posX, posY, posZ);

    if (Cfx.Client.GetEntityCoords(Cfx.Client.GetPlayerPed(Cfx.source), true)[2] < zCoord[1]) {
      Cfx.Client.SetEntityCoords(
        Cfx.Client.GetPlayerPed(Cfx.source),
        posX,
        posY,
        Number(zCoord),
        true,
        false,
        false,
        false
      );
    }
  }

  @Command()
  public pos(): void {
    console.log(
      JSON.stringify([
        ...Cfx.Client.GetEntityCoords(Cfx.Client.PlayerPedId(), true),
        ...Cfx.Client.GetEntityRotation(Cfx.Client.PlayerPedId(), 2),
        Cfx.Client.GetEntityHeading(Cfx.Client.PlayerPedId()),
      ])
    );
  }
}
