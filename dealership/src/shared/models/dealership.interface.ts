export interface Dealership {
  id: number;
  title: string;
  entranceX: number;
  entranceY: number;
  entranceZ: number;
  exitX: number;
  exitY: number;
  exitZ: number;
  blipId: number;
  markerId: number;
  vehicles: {
    [modelHash: number]: DealershipVehicle;
  };
  viewVehiclePosX: number;
  viewVehiclePosY: number;
  viewVehiclePosZ: number;
  viewVehiclePosH: number;
  viewCameraPosX: number;
  viewCameraPosY: number;
  viewCameraPosZ: number;
  buySpawnX: number;
  buySpawnY: number;
  buySpawnZ: number;
  buySpawnH: number;
}

export interface DealershipVehicle {
  stock: number;
  price: number;
  hash?: number;
}
