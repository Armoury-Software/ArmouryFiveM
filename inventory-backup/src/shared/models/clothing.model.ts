export interface Clothing {
  components: {
    [key: number]: {
      drawableId: number;
      textureId: number;
      paletteId?: number;
    };
    clothingId: string;
  };
  title?: string;
}
