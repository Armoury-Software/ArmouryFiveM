export interface Pet {
  name: string;
  pedId: string;
}

export interface PetExtended extends Pet {
  instance?: number;
}
