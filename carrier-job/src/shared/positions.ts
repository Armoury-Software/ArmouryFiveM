import { Blip } from '../../../[utils]/models/blip.model';
import { Marker, MarkerCircle } from '../../../[utils]/models/marker.model';
import { CarrierDeliveryPoint } from './models/delivery-point.model';

export const CARRIER_MARKERS = {
    getJobMarker: {
        marker: 24,
        pos: [-437.2915, -2789.35, 6.000384],
        scale: 1.0,
        rgba: [255, 255, 255, 255],
        blip: {
            id: 67,
            color: 0,
            title: 'Job - Carrier'
        } as Blip,
        underlyingCircle: {
            marker: 25,
            scale: 1.75,
            rgba: [255, 255, 255, 255]
        } as MarkerCircle,
        renderDistance: 35.0
    } as Marker,
};

export const CARRIER_QUICKSTART_POSITIONS: CarrierDeliveryPoint[] = [
    {
        pos: [-450.3496, -2794.806, 6.235213] // heading :: 45.061977386475
    }
];

export const CARRIER_PICKUP_POINTS: CarrierDeliveryPoint = {
    pos: [-522.5355, -2866.82, 4.00038]
}

export const MAX_PLAYER_PACKAGES: number = 15;
