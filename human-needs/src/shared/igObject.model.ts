export interface igObject {
  animationDict: string;
  animationName: string;
  animationOptions: {
    prop: string;
    propBone: number;
    propPlacement: number[];
  };
  duration: number;
}
