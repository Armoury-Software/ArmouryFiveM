import { Blip } from '../../../[utils]/models/blip.model';
import { Marker, MarkerCircle } from '../../../[utils]/models/marker.model';
import { UIButton } from '../../../[utils]/models/ui-button.model';

import {
  TruckerDeliveryPoint,
  TRUCKER_DELIVERY_TYPE,
} from './models/delivery-point.model';

export const TRUCKER_MARKERS = {
  getJobMarker: {
    marker: 39,
    pos: [94.81318664550781, -2675.472412109375, 5.993408203125],
    scale: 1.0,
    rgba: [255, 255, 255, 255],
    blip: {
      id: 477,
      color: 0,
      title: 'Job - Trucker',
    } as Blip,
    underlyingCircle: {
      marker: 25,
      scale: 1.75,
      rgba: [255, 255, 255, 255],
    } as MarkerCircle,
    renderDistance: 35.0,
  } as Marker,
};

export const TRUCKER_QUICKSTART_POSITIONS: {
  pos: number[];
  heading: number;
}[] = [
  {
    pos: [124.60220336914062, -2682.474609375, 6.229248046875],
    heading: 0.0,
  },
  {
    pos: [86.005, -2710.042, 6.234547],
    heading: 179.1072845459,
  },
  {
    pos: [82.2951, -2710.52, 6.233371],
    heading: 179.5913848877,
  },
  {
    pos: [55.83841, -2756.145, 6.233832],
    heading: 269.41738891602,
  },
  {
    pos: [56.78776, -2749.975, 6.234283],
    heading: 271.53430175781,
  },
  {
    pos: [66.38823, -2742.604, 6.233929],
    heading: 272.06002807617,
  },
  {
    pos: [64.73344, -2719.796, 6.234601],
    heading: 271.02471923828,
  },
  {
    pos: [66.13918, -2712.086, 6.233268],
    heading: 269.90515136719,
  },
  {
    pos: [68.56916, -2679.761, 6.233853],
    heading: 0.41856390237808,
  },
];

export const TRUCKER_DELIVERY_TRAILERS: Map<TRUCKER_DELIVERY_TYPE, number[]> =
  new Map([
    [
      TRUCKER_DELIVERY_TYPE.OIL,
      [
        -1207431159, // https://wiki.gtanet.work/images/1/13/ArmyTanker.png
        -730904777, // https://wiki.gtanet.work/images/e/e3/Tanker.png
        1956216962, // https://wiki.gtanet.work/images/2/25/Tanker2.png
      ],
    ],
    [
      TRUCKER_DELIVERY_TYPE.ELECTRICITY,
      [
        -2140210194, // https://wiki.gtanet.work/images/3/30/DockTrailer.png
      ],
    ],
    [
      TRUCKER_DELIVERY_TYPE.CARGO,
      [
        -1770643266, // https://wiki.gtanet.work/images/5/5b/TVTrailer.png
        -877478386, // https://wiki.gtanet.work/images/1/14/Trailers.png
      ],
    ],
  ]);

export const TRUCKER_DELIVERY_POINTS: TruckerDeliveryPoint[] = [
  {
    pos: [1367.4593505859375, -1867.7406005859375, 55.172119140625],
    type: TRUCKER_DELIVERY_TYPE.OIL,
  },
  {
    pos: [1398.2901611328125, -2062.23291015625, 50.5216064453125],
    type: TRUCKER_DELIVERY_TYPE.OIL,
  },
  {
    pos: [2678.835205078125, 1602.778076171875, 23.03955078125],
    type: TRUCKER_DELIVERY_TYPE.OIL,
  },
  {
    pos: [2815.7802734375, 1561.4505615234375, 23.10693359375],
    type: TRUCKER_DELIVERY_TYPE.ELECTRICITY,
  },
  {
    pos: [2046.909912109375, 3183.61328125, 43.5626220703125],
    type: TRUCKER_DELIVERY_TYPE.CARGO,
  },
  {
    pos: [1567.79345703125, 3791.630859375, 32.8125],
    type: TRUCKER_DELIVERY_TYPE.CARGO,
  },
  {
    pos: [346.8791198730469, 3418.773681640625, 34.952392578125],
    type: TRUCKER_DELIVERY_TYPE.ELECTRICITY,
  },
  {
    pos: [258.0659484863281, 2849.630859375, 42.13037109375],
    type: TRUCKER_DELIVERY_TYPE.ELECTRICITY,
  },
  {
    pos: [592.5758056640625, 2733.454833984375, 40.6138916015625],
    type: TRUCKER_DELIVERY_TYPE.CARGO,
  },
];

export const TRUCKER_MONEY_GAIN: { [type: string]: number } = {
  OIL: 0.1,
  ELECTRICITY: 0.15,
  'CARGO 1': 0.12,
  'CARGO 2': 0.15,
  'CARGO 3': 0.24,
  'CARGO 4': 0.28,
};
