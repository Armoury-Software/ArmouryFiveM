import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Sandwich extends NumberItem {
  public constructor(_identifier: string = 'sandwich', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
