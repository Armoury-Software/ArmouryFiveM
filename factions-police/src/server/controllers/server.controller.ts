import { ServerFactionController } from '../../../../[utils]/server/server-faction.controller';

export class Server extends ServerFactionController {
  public constructor() {
    super();

    this.registerCommands();
  }

  private findTargetPlayer(name: string): number {
    const players: number[] = global.exports['armoury'].getPlayers();

    let targetPlayer: number;

    players.forEach((player: number) => {
      if (
        global.exports['authentication']
          .getPlayerInfo(player, 'name')
          .toLowerCase() === name.toLowerCase()
      ) {
        targetPlayer = player;
      }
    });

    return targetPlayer;
  }

  private checkTargetAvailability(targetPlayer: number): boolean {
    if (!targetPlayer) {
      console.log(`No player found with specified name.`);
      return false;
    }
    return true;
  }

  private registerCommands(): void {
    RegisterCommand(
      'jail',
      (source: number, args: string[]) => {
        // if (global.exports['authentication'].getPlayerInfo(source, 'faction') !== 'Police Department') {
        //   console.log('Only a member of Police Department faction can use this command!');
        //   return;
        // }

        if (!args.length) {
          console.log('Error! Use /jail <target>.');
          return;
        }

        const targetPlayer: number = this.findTargetPlayer(args[0]);

        if (!this.checkTargetAvailability(targetPlayer)) {
          return;
        }

        if (global.exports['authentication'].getPlayerInfo(targetPlayer, 'jailTime')) {
          console.log('Player already in jail.');
          return;
        }

        global.exports['jail'].jailPlayer(targetPlayer);
      },
      false)
  }
}
