import { ExternalItem } from '../../../../inventory/src/shared/item-list.model';

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
  items: ExternalItem[];
  locked: boolean;
}

export interface VehicleExtended extends Vehicle {
  instanceId?: number;
  ownerName?: string;
  ownerInstance?: number;
}
