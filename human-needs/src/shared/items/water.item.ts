import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Water extends NumberItem {
  public constructor(_identifier: string = 'water', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
