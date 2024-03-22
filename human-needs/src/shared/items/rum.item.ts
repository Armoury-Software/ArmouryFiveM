import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Rum extends NumberItem {
  public constructor(_identifier: string = 'rum', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
