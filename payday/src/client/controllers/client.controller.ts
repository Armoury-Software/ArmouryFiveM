import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

import { Payday, Tax } from '@shared/payday.interface';

@FiveMController()
export class Client extends ClientController {
  constructor() {
    super();

    this.registerListeners();
  }

  private registerListeners(): void {
    onNet(`${GetCurrentResourceName()}:payday-given`, (payday: Payday) => {
      this.addToFeed(
        this.computeFeedText('Payday!', payday.gainings),
        this.computeFeedText(
          'House Taxes:',
          payday.taxes
            .filter((tax: Tax) => tax.name.includes('house-'))
            .map((tax: Tax) => ({
              name: tax.name.split('-')[1].replace('_', ' '),
              value: tax.value,
            }))
        ),
        this.computeFeedText(
          'Business Taxes:',
          payday.taxes
            .filter((tax: Tax) => tax.name.includes('business-'))
            .map((tax: Tax) => ({
              name: tax.name.split('-')[1].replace('_', ' '),
              value: tax.value,
            }))
        ),
        this.computeFeedText(
          'Vehicle Taxes:',
          payday.taxes
            .filter((tax: Tax) => tax.name.includes('vehicle-'))
            .map((tax: Tax) => ({
              name: tax.name.split('-')[1].replace('_', ' '),
              value: tax.value,
            }))
        ),
        this.computeFeedText(
          'Other Utilities:',
          payday.taxes
            .filter((tax: Tax) => tax.name.includes('other_utilities-'))
            .map((tax: Tax) => ({
              name: tax.name.split('-')[1].replace('_', ' '),
              value: tax.value,
            }))
        ),
        this.computeFeedText(
          'Updated Information:',
          payday.finalStats.map((tax: Tax) => ({
            name: tax.name.replace('_', ' '),
            value: tax.value,
          }))
        )
      );
    });
  }

  private computeFeedText(title: string, parameters: Tax[]): string {
    let text: string = `<C>${title.toUpperCase()}</C>~n~`;

    parameters.forEach((parameter: Tax, index: number) => {
      text += `${index > 0 ? '~n~' : ''}${
        parameter.name.slice(0, 1).toUpperCase() + parameter.name.slice(1)
      }: ${this.computeValueColor(parameter.value)}${parameter.value}~s~`;
    });

    return text;
  }

  private computeValueColor(parameter: string): string {
    if (parameter.includes('$')) {
      if (parameter.includes('-$') || parameter.includes('$-')) {
        return '~r~';
      }

      return '~g~';
    }

    return '~b~';
  }
}
