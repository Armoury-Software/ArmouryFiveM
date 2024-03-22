import { PlayerInfoType } from '../../../authentication/src/shared/models/player-info.type';

export interface ItemList {
  house_keys: Item[];
  business_keys: Item[];
  vehicles: Item[];
  weapons: Item[];
  misc: Item[];
}

export interface Item {
  topLeft: string;
  bottomRight: string;
  outline: string;
  image: string;
  width: number;
  type: string;
  description: string;
  _piKey?: string;
  value?: number;
  metadata?: { [key: string]: any };
}

export interface ExternalItem {
  piKey: string;
  amount: PlayerInfoType;
}

export interface AdditionalInventory {
  title: string;
  items: Item[];
}
