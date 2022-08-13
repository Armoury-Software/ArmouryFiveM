import { Weapons } from '../../../../weapons/src/shared/models/weapon.model';
import { Clothings, Items } from './player.model';

export type PlayerInfoType =
  | number
  | string
  | number[]
  | string[]
  | Items
  | Weapons
  | Clothings;
