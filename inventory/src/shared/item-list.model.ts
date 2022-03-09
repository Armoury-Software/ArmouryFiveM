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
}