import { PlayerInfoType } from '../../../../authentication/src/shared/models/player-info.type';
import { Pet } from '../../../../pets/src/shared/models/pet.interface';

export interface House {
  id: number;
  owner: string;
  level: number;
  entranceX: number;
  entranceY: number;
  entranceZ: number;
  exitX: number;
  exitY: number;
  exitZ: number;
  firstPurchasePrice: number;
  sellingPrice: number;
  rentPrice: number;
  tenantIds: number[];
  pet: Pet | object;
  fridge: PlayerInfoType;
}

export interface HouseExtended extends House {
  ownerInstance?: number;
}
