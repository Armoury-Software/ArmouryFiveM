import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientController {
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
  }

  private registerGlobalEvents(): void {
    on('gameEventTriggered', (name: string, _args: any[]) => {
      console.log(name);
      if (name === 'CEventNetworkEntityDamage') {
        const [
          killed,
          killer,
          unknown1,
          unknown2,
          unknown3,
          didPedDie,
          weaponHash,
          unknown4,
          unknown5,
          unknown6,
          unknown7,
          didPedHitParkedCar,
          unknown8,
        ]: any[] = _args;

        if (killed === GetPlayerPed(-1) && !!didPedDie) {
          TriggerServerEvent(`${GetCurrentResourceName()}:onPlayerDeath`);
          emit(`${GetCurrentResourceName()}:onPlayerDeath`);
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
  }
}
