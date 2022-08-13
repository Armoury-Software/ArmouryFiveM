export interface Faction {
  id: number;
  internalId: string;
  blipId: number;
  name: string;
  entranceX: number;
  entranceY: number;
  entranceZ: number;
  exitX: number;
  exitY: number;
  exitZ: number;
  towRange?: number;
  members: FactionMember[];
  rankNames: { [key: number]: string };
}

export interface FactionMember {
  /** The Faction Member ID from the DATABASE! */
  id: number;
  rank: number;
  hireTimestamp: number;
  warnings: number;
  tester: boolean;
  /** The Faction Member PLAYER ID from the SERVER! */
  onlineId?: number;
  onlineName?: string;
}
