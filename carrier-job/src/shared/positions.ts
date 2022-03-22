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
      title: 'Job - Carrier',
    } as Blip,
    underlyingCircle: {
      marker: 25,
      scale: 1.75,
      rgba: [255, 255, 255, 255],
    } as MarkerCircle,
    renderDistance: 35.0,
  } as Marker,
};

export const CARRIER_PICKUP_POINTS: CarrierDeliveryPoint = {
  pos: [-522.5355, -2866.82, 4.00038],
};

export const MAX_PLAYER_PACKAGES: number = 15;

export const QUICK_START_POSITIONS: CarrierDeliveryPoint[] = [
  {
    pos: [-446.9153, -2789.063, 6.235239],
    heading: 45.741329193115,
  },
  {
    pos: [-451.3338, -2793.433, 6.235086],
    heading: 44.816608428955,
  },
  {
    pos: [-455.8972, -2797.865, 6.234966],
    heading: 45.446887969971,
  },
  {
    pos: [-460.0097, -2803.387, 6.234551],
    heading: 46.289119720459,
  },
  {
    pos: [-465.4728, -2806.931, 6.235406],
    heading: 44.00715637207,
  },
  {
    pos: [-469.9589, -2811.282, 6.235197],
    heading: 44.704898834229,
  },
  {
    pos: [-478.795, -2820.706, 6.235507],
    heading: 44.421722412109,
  },
  {
    pos: [-482.9853, -2825.085, 6.234905],
    heading: 42.936206817627,
  },
  {
    pos: [-487.4949, -2829.414, 6.2355],
    heading: 44.357933044434,
  },
  {
    pos: [-496.1359, -2838.852, 6.235279],
    heading: 45.125789642334,
  },
  {
    pos: [-501.0648, -2843.006, 6.235568],
    heading: 44.902011871338,
  },
  {
    pos: [-505.8286, -2847.725, 6.235477],
    heading: 43.361728668213,
  },
  {
    pos: [-509.3217, -2852.742, 6.235679],
    heading: 44.833095550537,
  },
  {
    pos: [-514.6955, -2856.749, 6.234715],
    heading: 44.990550994873,
  },
  {
    pos: [-523.1985, -2865.529, 6.234864],
    heading: 45.825954437256,
  },
  {
    pos: [-497.9955, -2931.214, 6.234804],
    heading: 313.99432373047,
  },
  {
    pos: [-486.3418, -2919.647, 6.234973],
    heading: 44.816608428955,
  },
  {
    pos: [-474.5492, -2907.567, 6.236026],
    heading: 315.63311767578,
  },
  {
    pos: [-463.9725, -2896.759, 6.235685],
    heading: 315.61694335938,
  },
  {
    pos: [-450.5947, -2883.08, 6.234519],
    heading: 315.64935302734,
  },
  {
    pos: [-434.2419, -2867.086, 6.235113],
    heading: 314.50094604492,
  },
  {
    pos: [-419.145, -2857.767, 6.23515],
    heading: 269.00988769531,
  },
  {
    pos: [-413.2143, -2852.05, 6.235664],
    heading: 265.35162353516,
  },
  {
    pos: [-408.2009, -2846.277, 6.236984],
    heading: 261.86959838867,
  },
  {
    pos: [-391.88, -2829.22, 6.236408],
    heading: 272.56060791016,
  },
  {
    pos: [-377.2061, -2781.211, 6.234651],
    heading: 135.20986938477,
  },
  {
    pos: [-372.6074, -2786.071, 6.235931],
    heading: 130.64741516113,
  },
];
