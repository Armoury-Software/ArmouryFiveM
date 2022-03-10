import { Blip } from '../../../[utils]/models/blip.model';
import { Marker, MarkerCircle } from '../../../[utils]/models/marker.model';
import { CarrierDeliveryPoint } from './models/delivery-point.model';
import { Business } from '../../../businesses/src/shared/models/business.interface'

export const CARRIER_MARKERS = {
    getJobMarker: {
        marker: 24,
        pos: [-438.3229, -2795.065, 7.295934],
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

export const CARRIER_QUICKSTART_POSITIONS = [
    {
        pos: [-450.3496, -2794.806, 6.235213] // heading :: 45.061977386475
    }
];

export const CARRIER_DELIVERY_POINTS: CarrierDeliveryPoint[] = global.exports['businesses'].getEntities().map((business: Business) => ([business.entranceX, business.entranceY, business.entranceZ]))

export const CARRIER_PICKUP_POINTS: CarrierDeliveryPoint[] = [
    {
        pos: [-522.8812, -2866.733, 6.233475]
    },
    {
        pos: [-284.0852, -918.4753, 30.65682]
    }
]
