export interface TrunkInspectionData {
  vehicleEntityId: number;
  inspectionType: TRUNK_INSPECTION_TYPE;
}

export enum TRUNK_INSPECTION_TYPE {
  TRANSFER_TO_TRUNK = 0,
  TRANSFER_FROM_TRUNK_TO_ME,
  IDLE,
}
