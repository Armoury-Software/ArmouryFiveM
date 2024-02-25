import { Controller, Export, ServerController } from '@armoury/fivem-framework';

@Controller()
export class Server extends ServerController {
  @Export()
  public addBankMoney(
    playerId: number,
    amount: number,
    sender?: string,
    description?: string,
    skipDBSave: boolean = false
  ): void {
    const currentBankAmount: number = Number(Cfx.exports['authentication'].getPlayerInfo(playerId, 'bank'));

    Cfx.exports['authentication'].setPlayerInfo(playerId, 'bank', currentBankAmount + amount, skipDBSave);

    if (sender) {
      Cfx.TriggerClientEvent('phone:banking-transaction-add', playerId, {
        amount,
        sender,
        description: description || (amount < 0 ? 'Outgoing payment' : 'Earnings'),
        date: Date.now(),
      });
    }
  }
}
