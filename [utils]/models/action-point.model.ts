export interface ActionPoint {
  pos: number[],
  action: Function,
  id?: string;
  once?: boolean
  range?: number;
  onfootOnly?: boolean;
  inVehicleOnly?: boolean;
  onceIf?: Function;
}
