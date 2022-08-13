export interface Pet {
  name: string;
  pedId: string;
  price: number;
  key?: string;
}

export interface PetExtended extends Pet {
  instance?: number;
}

export interface PetUIModel {
  title: string;
  image: string;
  key: string;
}
