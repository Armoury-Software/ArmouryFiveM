import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

import { Payday, Tax } from '@shared/payday.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientController {
  @EventListener({ eventName: `${GetCurrentResourceName()}:payday-given` })
  public onPaydayGiven(payday: Payday): void {
    this.addToFeed(
      8000,
      this.computeFeedText(this.translate('payday'), payday.gainings),
      this.computeFeedText(
        `${this.translate('house_taxes')}:`,
        payday.taxes
          .filter((tax: Tax) => tax.name.includes('house-'))
          .map((tax: Tax) => ({
            name: tax.name.split('-')[1].replace('_', ' '),
            value: tax.value,
          }))
      ),
      this.computeFeedText(
        `${this.translate('business_taxes')}:`,
        payday.taxes
          .filter((tax: Tax) => tax.name.includes('business-'))
          .map((tax: Tax) => ({
            name: tax.name.split('-')[1].replace('_', ' '),
            value: tax.value,
          }))
      ),
      this.computeFeedText(
        `${this.translate('vehicle_taxes')}:`,
        payday.taxes
          .filter((tax: Tax) => tax.name.includes('vehicle-'))
          .map((tax: Tax) => ({
            name: tax.name.split('-')[1].replace('_', ' '),
            value: tax.value,
          }))
      ),
      this.computeFeedText(
        `${this.translate('other_utilities')}:`,
        payday.taxes
          .filter((tax: Tax) => tax.name.includes('other_utilities-'))
          .map((tax: Tax) => ({
            name: tax.name.split('-')[1].replace('_', ' '),
            value: tax.value,
          }))
      ),
      this.computeFeedText(
        `${this.translate('updated_information')}:`,
        payday.finalStats.map((tax: Tax) => ({
          name: tax.name.replace('_', ' '),
          value: tax.value,
        }))
      )
    );
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
