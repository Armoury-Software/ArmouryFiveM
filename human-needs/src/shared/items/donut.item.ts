import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Donut extends NumberItem {
  public constructor(_identifier: string = 'donut', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
