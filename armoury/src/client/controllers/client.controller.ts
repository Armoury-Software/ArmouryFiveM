import {
  ADMIN_GIVE_SELF,
  ADMIN_MENU_MAIN,
  ADMIN_GIVE_WEAPON,
} from '../../shared/admin-menu';
import { ClientController } from '../../../../[utils]/client/client.controller';
import { WEAPON_NAMES } from '../../../../weapons/src/shared/weapon';

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
      console.log(`on ${data}`);
      switch (data.menuId) {
        case 'admin-menu':
          switch (data.buttonSelected.label.toLowerCase()) {
            case 'give self':
              TriggerServerEvent(
                `${GetCurrentResourceName()}:open-admin-menu`,
                ADMIN_GIVE_SELF
              );
              break;
            case 'teleports':
              break;
            case 'player administration':
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
                  })),
                }
              );
            case 'give drugs':
              break;
            case 'give money':
              break;
          }
        case 'give-weapon':
          ExecuteCommand(
            `giveweapon ${<string>(
              this.getPlayerInfo('name')
            )} ${data.buttonSelected.label.replaceAll(' ', '')} 150`
          );
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
