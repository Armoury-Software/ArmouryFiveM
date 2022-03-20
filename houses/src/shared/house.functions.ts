import { House } from './models/house.interface';

export const getTenants = (house: House): number[] => {
  if (!Array.isArray(house.tenantIds)) {
    return Number(house.tenantIds) ? [Number(house.tenantIds)] : [];
  }

  return house.tenantIds;
};

export const addTenants = (house: House, ...tenantIds: number[]): void => {
  house.tenantIds = [...getTenants(house), ...tenantIds];
};

export const setTenants = (house: House, tenantIds: number[]): void => {
  house.tenantIds = tenantIds;
};
