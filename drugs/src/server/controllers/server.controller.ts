import { ServerController } from '../../../../[utils]/server/server.controller';
import { Drugs } from '../../shared/models/drugs.model';

export class Server extends ServerController {
  public constructor() {
    super();

    this.assignExports();
    this.registerCommands();
  }

  private givePlayerDrugs(
    playerId: number,
    type: string,
    amount: number
  ): void {
    let currentPlayerDrugs: Drugs = global.exports[
      'authentication'
    ].getPlayerInfo(playerId, 'drugs');

    if (type.toLowerCase() === 'marijuana') {
      type = 'Marijuana';
    } else {
      type = 'Cocaine';
    }

    if (!currentPlayerDrugs[type]) {
      currentPlayerDrugs[type] = amount;
    } else {
      currentPlayerDrugs[type] = currentPlayerDrugs[type] + amount;
    }

    global.exports['authentication'].setPlayerInfo(
      playerId,
      'drugs',
      currentPlayerDrugs
    );
  }

  private removePlayerDrugs(
    playerId: number,
    type: string,
    amount?: number
  ): boolean {
    let currentPlayerDrugs: Drugs = global.exports[
      'authentication'
    ].getPlayerInfo(playerId, 'drugs');

    if (type.toLowerCase() === 'marijuana') {
      type = 'Marijuana';
    } else {
      type = 'Cocaine';
    }

    if (
      !currentPlayerDrugs[type] ||
      currentPlayerDrugs[type] - Number(amount) < 0
    ) {
      return false;
    }

    currentPlayerDrugs[type] = amount ? currentPlayerDrugs[type] - amount : 0;

    if (currentPlayerDrugs[type] === 0) {
      delete currentPlayerDrugs[type];
    }

    global.exports['authentication'].setPlayerInfo(
      playerId,
      'drugs',
      currentPlayerDrugs
    );
    return true;
  }

  private verifyDrugType(type: string): boolean {
    if (
      type.toLowerCase() !== 'marijuana' &&
      type.toLowerCase() !== 'cocaine'
    ) {
      return false;
    }

    return true;
  }

  private registerCommands(): void {
    RegisterCommand(
      'usedrugs',
      (source: number, args: string[]) => {
        if (!args.length || !this.verifyDrugType(args[0])) {
          console.log(`Error! Use /usedrugs <type> | types: Cocaine/Marijuana`);
          return;
        }

        // emit

        if (this.removePlayerDrugs(source, args[0], 1)) {
          console.log(`Succesfully used 1g of ${args[0]}`);
        } else {
          console.log(`You don't have 1g of ${args[0]}.`);
        }

        return;
      },
      false
    );
  }

  private assignExports(): void {
    exports('givePlayerDrugs', this.givePlayerDrugs.bind(this));
    exports('removePlayerDrugs', this.removePlayerDrugs.bind(this));
    exports('verifyDrugType', this.verifyDrugType.bind(this));
  }
}
