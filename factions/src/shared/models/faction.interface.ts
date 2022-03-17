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
  members: FactionMember[];
}

export interface FactionMember {
  /** The Faction Member ID from the DATABASE! */
  id: number;
  rank: number;
  /** The Faction Member PLAYER ID from the SERVER! */
  onlineId?: number;
}
