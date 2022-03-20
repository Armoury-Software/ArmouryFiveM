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
}
