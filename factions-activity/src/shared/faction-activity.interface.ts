export interface FactionActivity {
  id: number;
  factionInternalId: string;
  type: string;
  playerDBId: number;
  timestamp: number | string;
  points: number;
}
