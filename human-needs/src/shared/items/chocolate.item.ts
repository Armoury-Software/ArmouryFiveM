import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Chocolate extends NumberItem {
  public constructor(_identifier: string = 'chocolate', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
