import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class BeerCan extends NumberItem {
  public constructor(_identifier: string = 'beer_can', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
