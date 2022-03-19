import { Skill } from '../../../../skills/src/shared/models/skill.model';
import { Weapon } from '../../../../weapons/src/shared/models/weapon.model';
import { Drugs } from '../../../../drugs/src/shared/models/drugs.model';

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
  name: string;
  phone: number;
  skills: Skill[];
  weapons: Weapon[];
  drugs: Drugs;
  wantedLevel: number;
  jailTime: number;
}
