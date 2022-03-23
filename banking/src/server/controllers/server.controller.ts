import { FiveMController } from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

@FiveMController()
export class Server extends ServerController {
  public constructor() {
    super();

    this.assignExports();
  }

  private addBankMoney(
    playerId: number,
    amount: number,
    sender?: string,
    description?: string,
    skipDBSave: boolean = false
  ): void {
    const currentBankAmount: number = Number(
      global.exports['authentication'].getPlayerInfo(playerId, 'bank')
    );
    global.exports['authentication'].setPlayerInfo(
      playerId,
      'bank',
      currentBankAmount + amount,
      skipDBSave
    );

    if (sender) {
      TriggerClientEvent('phone:banking-transaction-add', playerId, {
        amount,
        sender,
        description:
          description || (amount < 0 ? 'Outgoing payment' : 'Earnings'),
        date: Date.now(),
      });
    }
  }

  private assignExports(): void {
    exports('addBankMoney', this.addBankMoney.bind(this));
  }
}
