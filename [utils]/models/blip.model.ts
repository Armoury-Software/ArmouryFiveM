export interface Blip {
    id: number;
    color: number;
    title: string;
    pos: number[];
    scale?: number;
    alpha?: number;
    entityId?: number;
    type?: 'coords' | 'range' | 'entity';
    longRange?: boolean;
}

export interface BlipMonitored extends Blip {
    instance: number;
}
