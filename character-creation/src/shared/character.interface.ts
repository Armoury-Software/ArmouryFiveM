export interface Character {
  name: string;
  days: number;
  age: number;
  faction?: string;
  id?: number;
  face?: Face;
  faceFeatures?: number[];
  componentVariations?: number[];
  headOverlays?: number[];
}

export interface Face {
  sex: 'male' | 'female';
  componentId: number;
}

export interface CharacterUpdate extends Character {
  shouldFinalize: boolean;
  latestCustomization: [number, number];
}
