import { Skill } from '../../../../skills/src/shared/models/skill.model';
import { Drugs } from '../../../../drugs/src/shared/models/drugs.model';
import { Weapons } from '../../../../weapons/src/shared/models/weapon.model';
import { Clothing } from '../../../../inventory/src/shared/models/clothing.model';

export interface PlayerBase {
  hoursPlayed: number;
  accountId: number;
  id: number;
}

export interface PlayerMonitored extends PlayerBase {
  lastHoursPlayedCheck: Date;
}

export interface Player extends PlayerBase {
  adminLevel: number;
  bank: number;
  cash: number;
  email: string;
  items: Items;
  clothings: Clothings;
  outfit: Clothing;
  name: string;
  phone: number;
  skills: Skill[];
  weapons: Weapons;
  drugs: Drugs;
  hunger: number;
  thirst: number;
  lastLocation: number[];
  xp: number;
}

export interface Items {
  [item: string]: number;
}

export interface Clothings {
  [item: string]: Clothing;
}
