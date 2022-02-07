export interface Blip {
    id: number;
    color: number;
    title: string;
    pos: number[];
}

export interface BlipMonitored extends Blip {
    instance: number;
}
