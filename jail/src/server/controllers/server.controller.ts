import { JAIL_POSITIONS, JAIL_TIME, UNJAIL_POSTION } from '../../shared/jail';
import { ServerController } from '../../../../[utils]/server/server.controller';

export class Server extends ServerController {
  public constructor() {
    super();

    this.assignTimers();
    this.registerExports();
    this.assignListeners();
  }

  private jailedPlayers: Map<number, number> = new Map<number, number>();

  private updateJailUI(target: number): void {
    global.exports['armoury-overlay'].setMessage(target, {
      id: 'jail-time',
      content:
        `Jail time left: ${Math.floor(
          this.jailedPlayers.get(target) / 60
        )} min` +
        (this.jailedPlayers.get(target) % 60 != 0
          ? ` ${this.jailedPlayers.get(target) % 60} sec`
          : ''),
    });
  }

  private removeJailUI(target: number): void {
    global.exports['armoury-overlay'].deleteMessage(target, {
      id: 'jail-time',
    });
  }

  private jailPlayer(target: number): void {
    let jailTime: number;
    if (global.exports['authentication'].getPlayerInfo(target, 'jailTime')) {
      jailTime = global.exports['authentication'].getPlayerInfo(
        target,
        'jailTime'
      );
    } else {
      jailTime =
        JAIL_TIME *
        global.exports['authentication'].getPlayerInfo(target, 'wantedLevel');
    }
    this.jailedPlayers.set(target, jailTime);
    const jailPosition: number[] =
      JAIL_POSITIONS[Math.floor(Math.random() * JAIL_POSITIONS.length)].pos;
    SetEntityCoords(
      GetPlayerPed(target),
      jailPosition[0],
      jailPosition[1],
      jailPosition[2],
      true,
      false,
      false,
      false
    );
    global.exports['authentication'].setPlayerInfo(target, 'wantedLevel', 0);
    global.exports['authentication'].setPlayerInfo(
      target,
      'jailTime',
      jailTime
    );
  }

  private unJailPlayer(target: number): void {
    this.jailedPlayers.delete(target);
    global.exports['authentication'].setPlayerInfo(target, 'jailTime', 0);
    SetEntityCoords(
      GetPlayerPed(target),
      UNJAIL_POSTION[0],
      UNJAIL_POSTION[1],
      UNJAIL_POSTION[2],
      true,
      false,
      false,
      false
    );
    this.removeJailUI(target);
  }

  private assignTimers(): void {
    setInterval(() => {
      Array.from(this.jailedPlayers.keys()).forEach((target: number) => {
        this.updateJailUI(target);
        this.jailedPlayers.set(target, this.jailedPlayers.get(target) - 1);
        global.exports['authentication'].setPlayerInfo(
          target,
          'jailTime',
          this.jailedPlayers.get(target)
        );
        if (this.jailedPlayers.get(target) === 0) {
          this.unJailPlayer(target);
        }
      });
    }, 1000);
  }

  private assignListeners(): void {
    onNet('authentication:player-authenticated', (target: number) => {
      console.log(
        global.exports['authentication'].getPlayerInfo(target, 'jailTime')
      );
      if (
        global.exports['authentication'].getPlayerInfo(target, 'jailTime') > 0
      ) {
        this.jailPlayer(target);
      }
    });

    on('playerDropped', (_reason: string) => {
      if (this.jailedPlayers.has(source)) {
        this.jailedPlayers.delete(source);
      }
    });
  }

  private registerExports(): void {
    exports('jailPlayer', this.jailPlayer.bind(this));
    exports('unJailPlayer', this.unJailPlayer.bind(this));
  }
}
