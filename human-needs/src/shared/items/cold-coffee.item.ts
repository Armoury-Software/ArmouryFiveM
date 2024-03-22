import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class ColdCoffee extends NumberItem {
  public constructor(_identifier: string = 'cold_coffee', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
