export interface Blip {
    id: number;
    color: number;
    title: string;
    pos: number[];
    longRange?: boolean;
}

export interface BlipMonitored extends Blip {
    instance: number;
}
