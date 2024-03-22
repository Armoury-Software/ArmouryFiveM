import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Whiskey extends NumberItem {
  public constructor(_identifier: string = 'whiskey', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
