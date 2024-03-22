import { NumberItem } from '@armoury/fivem-roleplay-gamemode';

export class Medkit extends NumberItem {
  public constructor(_identifier: string = 'medkit', _value: number = null) {
    super(_identifier, 10, false, _value);
  }
}
