import {
  ADMIN_GIVE_SELF,
  ADMIN_MENU_MAIN,
  ADMIN_GIVE_WEAPON,
  ADMIN_GIVE_DRUGS,
  ADMIN_GIVE_MONEY,
  ADMIN_PLAYER_ADMINISTRATION,
  ADMIN_TELEPORT,
  ADMIN_VEHICLES,
  ADMIN_ENTITIES,
} from '../../shared/admin-menu';
import { ClientController } from '../../../../[utils]/client/client.controller';
import { WEAPON_NAMES } from '../../../../weapons/src/shared/weapon';
import { TELEPORT_POINTS } from '../../shared/teleport-locations';
import { Console } from 'console';

export class Client extends ClientController {
  private deathEventTriggered: boolean = false;
  private menuToggles: Map<string, boolean> = new Map<string, boolean>();

  public constructor() {
    super();

    this.assignListeners();
    this.registerKeyBindings();
    this.registerGlobalEvents();
  }

  private assignListeners(): void {
    const spawnPosition = [
      247.83297729492188, -343.20001220703125, 44.4615478515625, 0, 0,
      158.7401580810547,
    ];

    on('onClientGameTypeStart', () => {
      globalThis.exports.spawnmanager.setAutoSpawnCallback(() => {
        globalThis.exports.spawnmanager.spawnPlayer(
          {
            x: spawnPosition[0],
            y: spawnPosition[1],
            z: spawnPosition[2],
            model: 'a_m_m_skater_01',
          },
          () => {
            emit('chat:addMessage', {
              args: ['Welcome to the party!~'],
            });

            SetEntityRotation(
              GetPlayerPed(-1),
              spawnPosition[3],
              spawnPosition[4],
              spawnPosition[5],
              2,
              true
            );
          }
        );
      });

      globalThis.exports.spawnmanager.setAutoSpawn(true);
      globalThis.exports.spawnmanager.forceRespawn();
    });

    on('armoury-overlay:context-menu-item-pressed', (data: any) => {
      switch (data.menuId) {
        case 'admin-menu':
          switch (data.buttonSelected.label.toLowerCase()) {
            case 'give self':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_GIVE_SELF,
                  items: ADMIN_GIVE_SELF.items.filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  })
                }
              );
              break;
            case 'teleports':
              let teleportPoints = ['waypoint'];
              for (let teleportPoint in TELEPORT_POINTS) {
                teleportPoints.push(teleportPoint);
              }
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_TELEPORT,
                  items: teleportPoints.map((teleport, index) => ({
                    label: teleport,
                    active: !index ? true : false,
                    adminLevel: 1
                  })).filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  }),
                }
              );

              break;
            case 'player administration':
              // TODO
              break;
            case 'remove entities':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_ENTITIES,
                  items: ADMIN_ENTITIES.items.filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  })
                }
              );
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
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_GIVE_WEAPON,
                  items: weaponNames.map((weapon, index) => ({
                    label: weapon,
                    active: !index ? true : false,
                    adminLevel: 4
                  })).filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  }),
                }
              );
              break;
            case 'give drugs':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_GIVE_DRUGS,
                  items: ADMIN_GIVE_DRUGS.items.filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  })
                }
              );
              break;
            case 'give money':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_GIVE_MONEY,
                  items: ADMIN_GIVE_MONEY.items.filter((item) => {
                    item.adminLevel <= this.getPlayerInfo('adminLevel');
                  })
                }
              );
              break;
            case 'give vehicle':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                {
                  ...ADMIN_VEHICLES,
                  items: ADMIN_VEHICLES.items.filter((item) => {
                  item.adminLevel <= this.getPlayerInfo('adminLevel');
                })
              }
              );
              break;
          }
        case 'give-weapon':
          if (
            data.buttonSelected.label.toLowerCase() !== 'give weapon' &&
            data.buttonSelected.label.toLowerCase() !== 'give drugs' &&
            data.buttonSelected.label.toLowerCase() !== 'give money'
          ) {
            ExecuteCommand(
              `giveweapon ${<string>(
                this.getPlayerInfo('name')
              )} ${data.buttonSelected.label.replaceAll(' ', '')} 150`
            );
          }
          break;
        case 'give-drugs':
          if (data.buttonSelected.label.toLowerCase() !== 'give drugs') {
            ExecuteCommand(
              `agivedrugs ${<string>this.getPlayerInfo('name')} ${
                data.buttonSelected.label
              } 10`
            );
          }
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
                const valueZ = GetGroundZFor_3dCoord_2(
                  coord[0],
                  coord[1],
                  coord[2],
                  false
                );
                if (coord) {
                  ExecuteCommand(
                    `tp ${coord[0]} ${coord[1]} ${
                      valueZ[1] ? valueZ[1] : coord[2]
                    }`
                  );
                } else {
                  console.log(
                    'Please put a waypoint before using the command.'
                  );
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
              ExecuteCommand(
                `destroy${data.buttonSelected.label.toLowerCase()}`
              );
            } else {
              ExecuteCommand(
                `remove${data.buttonSelected.label.toLowerCase()}`
              );
            }
          }
          break;
      }
    });
  }

  private registerGlobalEvents(): void {
    on('gameEventTriggered', (name: string, _args: any[]) => {
      if (name === 'CEventNetworkEntityDamage') {
        if (!this.deathEventTriggered && !GetEntityHealth(GetPlayerPed(-1))) {
          this.deathEventTriggered = true;
          TriggerServerEvent(`${GetCurrentResourceName()}:onPlayerDeath`);

          setTimeout(() => {
            this.deathEventTriggered = false;
          }, 3000);
        }
      }
    });
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+opengeneralmenu',
      () => {
        if (this.menuToggles.get('general-menu') === true) {
          this.menuToggles.set('general-menu', false);
          return;
        }

        TriggerServerEvent(`${GetCurrentResourceName()}:open-general-menu`);
        this.menuToggles.set('general-menu', true);
      },
      false
    );

    RegisterKeyMapping(
      '+opengeneralmenu',
      'Open General Menu',
      'keyboard',
      'k'
    );

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
          this.menuToggles.set('admin-menu', true);
        }
      },
      false
    );

    RegisterKeyMapping('+openadminmenu', 'Open Admin Menu', 'keyboard', 'f1');
  }
}
