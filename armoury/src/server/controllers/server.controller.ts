import { ServerController } from '../../../../[utils]/server/server.controller';

const fs = require('fs');

export class Server extends ServerController {
  protected _players: number[] = [];

  public constructor() {
    super();

    this.registerCommands();
    this.registerFiveMEventListeners();
    this.registerListeners();
    this.registerExports();

    this._players = [];
    for (let i = 0; i < 1024; i++) {
      if (NetworkIsPlayerActive(i)) {
        this._players.push(i);
      }
    }
  }

  private registerCommands(): void {
    RegisterCommand(
      'pos',
      (source: number, args: string[]) => {
        let position: number[] = [];
        let rotation: number[] = [];

        if (GetVehiclePedIsIn(GetPlayerPed(source), true) !== 0) {
          position = GetEntityCoords(
            GetVehiclePedIsIn(GetPlayerPed(source), false),
            true
          );
          rotation = GetEntityRotation(
            GetVehiclePedIsIn(GetPlayerPed(source), false),
            2
          );
        } else {
          position = GetEntityCoords(GetPlayerPed(source), true);
          rotation = GetEntityRotation(GetPlayerPed(source), 2);
        }
        const computedString: string = `${position
          .map((numb: number) => Number(numb.toString()).toFixed(4))
          .join(',')},${rotation
          .map((numb: number) => Number(numb.toString()))
          .join(',')}`;

        console.log(`Source position is ${computedString}`);

        fs.appendFile(
          'savedpositions.txt',
          `\n${computedString} ${args.slice().shift()}`,
          () => {}
        );
      },
      false
    );
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
