import { ServerController } from '@core/server/server.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

@FiveMController()
export class Server extends ServerController {
  protected _players: number[] = [];

  public constructor() {
    super();

    this.registerFiveMEventListeners();
    this.registerListeners();
    this.registerExports();

    this._players = [];
  }

  private registerListeners(): void {
    onNet(`${GetCurrentResourceName()}:open-general-menu`, () => {
      global.exports['armoury-overlay'].showContextMenu(source, {
        title: 'General Menu',
        id: 'general-menu',
        items: [
          {
            label: 'GPS',
            active: true,
          },
          {
            label: 'Legitimation',
          },
        ],
      });
    });
  }

  private registerFiveMEventListeners(): void {
    onNet('playerJoining', (_source: number, _oldId: number) => {
      this._players.push(source);
    });

    onNet('playerDropped', (_reason: string) => {
      this._players = this._players.filter(
        (player: number) => player !== source
      );
    });
  }

  public getPlayers(): number[] {
    return this._players;
  }

  private registerExports(): void {
    exports('getPlayers', this.getPlayers.bind(this));
  }
}
