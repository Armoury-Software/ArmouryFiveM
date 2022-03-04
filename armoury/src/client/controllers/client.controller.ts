import { ClientController } from '../../../../[utils]/client/client.controller';
import { numberWithCommas } from '../../../../[utils]/utils';

export class Client extends ClientController {
    public constructor() {
      super();

      this.assignListeners();
    }

    private assignListeners(): void {
      const spawnPosition = [247.83297729492188,-343.20001220703125,44.4615478515625,0,0,158.7401580810547];

      on('onClientGameTypeStart', () => {
        globalThis.exports.spawnmanager.setAutoSpawnCallback(() => {
          globalThis.exports.spawnmanager.spawnPlayer(
            {
              x: spawnPosition[0],
              y: spawnPosition[1],
              z: spawnPosition[2],
              model: 'a_m_m_skater_01'
            },
            () => {
              emit('chat:addMessage', {
                args: [
                'Welcome to the party!~'
                ]
              })

              SetEntityRotation(GetPlayerPed(-1), spawnPosition[3], spawnPosition[4], spawnPosition[5], 2, true)
            }
          );
        });

        globalThis.exports.spawnmanager.setAutoSpawn(true);
        globalThis.exports.spawnmanager.forceRespawn();

        /*this.addToFeed(
          '<C>PAYDAY!</C>~n~' +
          `Salary: ~g~$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}~s~~n~` +
          `Interest: ~g~$${numberWithCommas(10 + Math.floor(Math.random()) * 200)} (0.0001%)~s~~n~`,

          '<C>HOUSE TAXES:</C>~n~' +
          `Energy: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}~s~~n~` +
          `Gas: ~r~-$${numberWithCommas(Number(this.getPlayerInfo('bank')))}~s~~n~` +
          `Contributions: ~r~-$${numberWithCommas(Number(this.getPlayerInfo('bank')))}`,

          '<C>BUSINESS TAXES:</C>~n~' +
          `Energy: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}~s~~n~` +
          `Contributions: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}`,

          '<C>VEHICLE TAXES:</C>~n~' +
          `Contributions: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}~s~~n~` +
          `Insurance: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}`,

          '<C>OTHER UTILITIES:</C>~n~' +
          `Phone service: ~r~-$${numberWithCommas(1000 + Math.floor(Math.random()) * 1000)}`,

          '<C>UPDATED INFORMATION:</C>~n~' +
          `Days: ~b~${numberWithCommas(Number(this.getPlayerInfo('hoursPlayed')))}~s~~n~` +
          `New balance: ~g~$${numberWithCommas(Number(this.getPlayerInfo('bank')))}~s~`
        );*/
      });
    }
}