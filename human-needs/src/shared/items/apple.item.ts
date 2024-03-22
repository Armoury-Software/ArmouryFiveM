import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Apple extends NumberItem {
  public constructor(_identifier: string = 'apple', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
