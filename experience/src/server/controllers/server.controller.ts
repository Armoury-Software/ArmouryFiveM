import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

import { EXPERIENCE_DEFAULTS } from '@shared/defaults';

import { Player } from '../../../../authentication/src/shared/models/player.model';

@FiveMController()
export class Server extends ServerController {
  @Export()
  public setPlayerXP(playerId: number, xp: number): void {
    global.exports['authentication'].setPlayerInfo(playerId, 'xp', xp);

    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'level',
      icon: 'hourglass_bottom',
      value: `Level ${this.getLevelByXP(xp)}`,
    });
  }

  @Export()
  public givePlayerXP(playerId: number, xp: number): void {
    this.setPlayerXP(
      playerId,
      xp +
        Number(global.exports['authentication'].getPlayerInfo(playerId, 'xp'))
    );
  }

  @Export()
  public getLevelByXP(xp: number): number {
    return Math.max(
      1,
      Math.ceil(
        Math.log(xp / EXPERIENCE_DEFAULTS.XP_PER_LEVEL) /
          Math.log(EXPERIENCE_DEFAULTS.XP_MULTIPLIER_PER_LEVEL)
      )
    );
  }

  @Export()
  public getPlayerLevel(playerId: number): number {
    const currentPlayerExperience: number = this.getPlayerExperience(playerId);

    return this.getLevelByXP(currentPlayerExperience);
  }

  @Export()
  public getPlayerExperience(playerId: number): number {
    return Number(
      global.exports['authentication'].getPlayerInfo(playerId, 'xp')
    );
  }

  @Export()
  public getXPForLevel(level: number): number {
    return (
      EXPERIENCE_DEFAULTS.XP_PER_LEVEL *
      Math.pow(EXPERIENCE_DEFAULTS.XP_MULTIPLIER_PER_LEVEL, level)
    );
  }

  @EventListener()
  public onPlayerAuthenticate(
    playerAuthenticated: number,
    playerInfo: Player
  ): void {
    if (!playerInfo.xp) {
      this.givePlayerXP(playerAuthenticated, this.getXPForLevel(1));
    } else {
      this.setPlayerXP(playerAuthenticated, playerInfo.xp);
    }
  }
}
