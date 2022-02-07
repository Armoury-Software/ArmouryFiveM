export interface TruckerDeliveryPoint {
    pos: number[];
    type: TRUCKER_DELIVERY_TYPE;
};

export enum TRUCKER_DELIVERY_TYPE {
    CARGO = 0,
    ELECTRICITY,
    OIL
}