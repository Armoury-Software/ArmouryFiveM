import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Champagne extends NumberItem {
  public constructor(_identifier: string = 'champagne', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
