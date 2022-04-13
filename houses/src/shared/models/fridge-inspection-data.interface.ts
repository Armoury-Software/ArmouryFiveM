export interface FridgeInspectionData {
  houseId: number;
  inspectionType: FRIDGE_INSPECTION_TYPE;
}

export enum FRIDGE_INSPECTION_TYPE {
  TRANSFER_TO_FRIDGE = 0,
  TRANSFER_FROM_FRIDGE_TO_ME,
  IDLE,
}
