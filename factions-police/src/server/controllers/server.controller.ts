import { ServerFactionController } from '../../../../[utils]/server/server-faction.controller';
import { isPlayerInRangeOfPoint } from '../../../../[utils]/utils';

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
        
        if (
          global.exports['authentication'].getPlayerInfo(
            targetPlayer,
            'jailTime'
          )
        ) {
          console.log('Player already in jail.');
          return;
        }

        if (
          global.exports['authentication'].getPlayerInfo(
            targetPlayer,
            'wantedLevel'
          ) === 0
        ) {
          console.log(`Player doesn't have a wanted level.`);
          return;
        }

        const targetPlayerPos: number[] = GetEntityCoords(GetPlayerPed(targetPlayer));
        const sourcePos: number[] = GetEntityCoords(GetPlayerPed(source));

        if (isPlayerInRangeOfPoint(sourcePos[0], sourcePos[1], sourcePos[2], targetPlayerPos[0], targetPlayerPos[1], targetPlayerPos[2], 10.0)) {
          global.exports['jail'].jailPlayer(targetPlayer);
        } else {
          console.log('You need to be near the player you want to put in jail.')
        }
      },
      false
    );
  }
}
