import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Bandages extends NumberItem {
  public constructor(_identifier: string = 'bandages', _value: number = null) {
    super(_identifier, 4, false, _value);
  }
}
