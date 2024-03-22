import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Coke extends NumberItem {
  public constructor(_identifier: string = 'coke', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
