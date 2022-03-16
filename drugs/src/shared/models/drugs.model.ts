export interface Drugs {
  [drugType: string]: number;
}

export interface Seeds {
  [seedDrugType: string]: number;
}

export interface Plant {
  id: number;
  pos: number[];
  growthState: Growth_State;
  seedType: string;
}

export enum Growth_State {
  GROWTH_NONE = 0,
  GROWTH_GROWING = 1,
  GROWTH_FINISHED = 2,
}
