import { Skill } from '../../../../skills/src/shared/models/skill.model';
import { Drugs } from '../../../../drugs/src/shared/models/drugs.model';
import { Weapons } from '../../../../weapons/src/shared/models/weapon.model';

export interface PlayerBase {
  hoursPlayed: number;
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
  name: string;
  phone: number;
  skills: Skill[];
  weapons: Weapons;
  drugs: Drugs;
  hunger: number;
  thirst: number;
  xp: number;
}

export interface Items {
  [item: string]: number;
}
