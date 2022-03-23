export interface Vehicle {
  id: number;
  modelHash: number;
  owner: number;
  primaryColor: number;
  secondaryColor: number;
  posX: number;
  posY: number;
  posZ: number;
  posH: number;
  plate: string;
}

export interface VehicleExtended {
  instanceId?: number;
  ownerName?: string;
  ownerInstance?: number;
}
