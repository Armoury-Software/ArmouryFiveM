import { FiveMController } from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';
import { numberWithCommas } from '@core/utils';

import { Payday } from '@shared/payday.interface';

@FiveMController()
export class Server extends ServerController {
  private paydayInterval;

  constructor() {
    super();

    this.assignListeners();
  }

  private assignListeners(): void {
    this.paydayInterval = setInterval(() => {
      if (new Date().getMinutes() === 0) {
        const businesses = global.exports['businesses'].getEntities();
        const players: number[] =
          global.exports['authentication'].getAuthenticatedPlayers();

        const taxes: Map<string, number> = new Map([
          [
            'electricity',
            businesses.find(
              (business: any) => business.name === 'Electricity Company'
            )?.productPrice || 100,
          ],
          [
            'gas',
            businesses.find((business: any) => business.name === 'Gas Company')
              ?.productPrice || 100,
          ],
          [
            'phone',
            businesses.find(
              (business: any) => business.name === 'Phone Company'
            )?.productPrice || 100,
          ],
        ]);

        players.forEach((player: number) => {
          const housePrice: number =
            global.exports['houses']
              .getEntities()
              .find((house: any) => house.owner === GetPlayerName(player))
              ?.firstPurchasePrice || 0;
          const houseTax: number = Math.floor(Number(0.0005 * housePrice));
          const businessPrice: number =
            businesses.find(
              (business: any) => business.owner === GetPlayerName(player)
            )?.firstPurchasePrice || 0;
          const businessTax: number = Number(0.0005 * businessPrice);
          const salary: number = Math.floor(1000 + Math.random() * 1000);
          const interest: number = Math.max(
            0,
            Math.floor(
              0.000001 *
                Number(
                  global.exports['authentication'].getPlayerInfo(player, 'bank')
                )
            )
          );
          const vehicleInsurance: number = /* TODO: Vehicle insurance */ 0;
          const vehicleContributions: number = /* TODO: Vehicle contributions */ 0;

          const totalTaxes: number =
            0 -
            (housePrice > 0 ? taxes.get('electricity') : 0) -
            (housePrice > 0 ? taxes.get('gas') : 0) -
            (housePrice > 0 ? houseTax : 0) -
            (businessPrice > 0 ? taxes.get('electricity') : 0) -
            (businessPrice > 0 ? businessTax : 0) -
            vehicleInsurance -
            vehicleContributions -
            taxes.get('phone');
          if (interest > 0) {
            global.exports['banking'].addBankMoney(
              player,
              interest,
              'Interest',
              'Based on your savings',
              true
            );
          }

          global.exports['banking'].addBankMoney(
            player,
            totalTaxes,
            'Taxes',
            'Services and insurances',
            true
          );
          global.exports['banking'].addBankMoney(
            player,
            salary,
            'Payday',
            'Your latest paycheck',
            true
          );

          const payday: Payday = {
            gainings: [
              {
                name: 'salary',
                value: '$' + numberWithCommas(salary),
              },
              {
                name: 'interest',
                value: `$${numberWithCommas(interest)}`,
              },
            ],
            taxes: [
              {
                name: 'house-energy',
                value: '-$' + numberWithCommas(taxes.get('electricity')),
              },
              {
                name: 'house-gas',
                value: '-$' + numberWithCommas(taxes.get('gas')),
              },
              {
                name: 'house-contributions',
                value: '-$' + numberWithCommas(houseTax),
              },
              {
                name: 'business-energy',
                value: '-$' + numberWithCommas(taxes.get('electricity')),
              },
              {
                name: 'business-contributions',
                value: '-$' + numberWithCommas(businessTax),
              },
              {
                name: 'vehicle-insurance',
                value: '-$' + numberWithCommas(vehicleInsurance),
              },
              {
                name: 'vehicle-contributions',
                value: '-$' + numberWithCommas(vehicleContributions),
              },
              {
                name: 'other_utilities-phone_service',
                value: '-$' + numberWithCommas(taxes.get('phone')),
              },
            ],
            finalStats: [
              {
                name: 'days',
                value: numberWithCommas(
                  Number(
                    Number(
                      global.exports['authentication'].getPlayerInfo(
                        player,
                        'hoursPlayed'
                      )
                    ).toFixed(1)
                  )
                ),
              },
              {
                name: 'new_balance',
                value:
                  '$' +
                  numberWithCommas(
                    Number(
                      global.exports['authentication'].getPlayerInfo(
                        player,
                        'bank'
                      )
                    )
                  ),
              },
            ],
          };

          TriggerClientEvent(
            `${GetCurrentResourceName()}:payday-given`,
            player,
            payday
          );
        });
      }
    }, 60 * 1000);

    onNet('onResourceStop', (resourceName: string) => {
      if (resourceName === GetCurrentResourceName()) {
        clearInterval(this.paydayInterval);
      }
    });
  }
}
