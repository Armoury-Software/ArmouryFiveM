import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class RedBull extends NumberItem {
  public constructor(_identifier: string = 'red_bull', _value: number = null) {
    super(_identifier, 1, false, _value);
  }
}
