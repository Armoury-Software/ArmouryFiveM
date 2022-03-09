export interface Business {
    id: number;
    name: string;
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
    partnerIds: number[];
    parent: number;
    productPrice: number;
}