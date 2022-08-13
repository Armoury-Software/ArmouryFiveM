import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerFactionController } from '@core/server/server-faction.controller';
import { isPlayerInRangeOfPoint } from '@core/utils';
import { ItemConstructor } from '../../../../inventory/src/shared/helpers/inventory-item.constructor';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerFactionController {
  public constructor() {
    super();

    this.registerVehicleKeyLockerPosition([444.8949, -975.2115, 30.6896]);

    this.registerVehicles(
      [0, 111],
      {
        modelHash: GetHashKey('police3'),
        pos: [
          408.31689453125, -980.0968017578125, 29.023929595947266,
          -0.026310572400689125, 0.016248272731900215, -128.47213745117188,
          231.52786254882812,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          408.1926574707031, -984.3505859375, 29.023021697998047,
          -0.007613746915012598, 0.08286163955926895, -127.07042694091797,
          232.92953491210938,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          408.1730651855469, -988.7700805664062, 29.022117614746094,
          0.009007594548165798, 0.08180800080299377, -126.78297424316406,
          233.21697998046875,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          408.2438049316406, -993.3085327148438, 29.021757125854492,
          -0.013745448552072048, 0.008528724312782288, -126.09483337402344,
          233.90516662597656,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          408.2897644042969, -998.0984497070312, 29.022703170776367,
          0.0021365443244576454, 0.05379696935415268, -129.46986389160156,
          230.53012084960938,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          427.6248779296875, -1028.1812744140625, 28.740129470825195,
          0.01429036259651184, 1.0300788879394531, 4.262526988983154,
          4.261839389801025,
        ],
      },
      {
        modelHash: GetHashKey('police3'),
        pos: [
          435.0706787109375, -1027.407958984375, 28.607723236083984,
          -0.06554632633924484, 1.0455244779586792, 5.618553638458252,
          5.617639541625977,
        ],
      },
      {
        modelHash: GetHashKey('riot'),
        pos: [
          454.22198486328125, -1024.1842041015625, 28.123220443725586,
          1.2663788795471191, 1.3043651580810547, 93.13072204589844,
          93.10202026367188,
        ],
      },
      {
        modelHash: GetHashKey('baller6'),
        pos: [
          463.0874328613281, -1019.4107666015625, 28.010923385620117,
          0.033601343631744385, 0.6991750001907349, 89.29877471923828,
          89.29835510253906,
        ],
      },
      {
        modelHash: GetHashKey('pariah'),
        pos: [
          463.5794677734375, -1014.8294677734375, 27.497039794921875,
          -0.18893691897392273, 0.8406251072883606, 91.5700912475586,
          91.57289123535156,
        ],
      },
      {
        modelHash: GetHashKey('policet'),
        pos: [
          452.55621337890625, -997.1491088867188, 25.748340606689453,
          -0.7711249589920044, 0.15810152888298035, -179.3160858154297,
          180.6839599609375,
        ],
      },
      {
        modelHash: GetHashKey('policeb'),
        pos: [
          447.1888122558594, -996.4861450195312, 25.246946334838867,
          -0.5714232921600342, -10.015334129333496, 179.16946411132812,
          179.18206787109375,
        ],
      },
      {
        modelHash: GetHashKey('police2'),
        pos: [
          436.4246826171875, -996.5646362304688, 25.383119583129883,
          -0.8905674815177917, -0.011209098622202873, -179.8070526123047,
          180.19297790527344,
        ],
      },
      {
        modelHash: GetHashKey('fbi'),
        pos: [
          431.07928466796875, -996.6939086914062, 25.415868759155273,
          -0.8773046135902405, 0.05976605415344238, -178.89976501464844,
          181.10035705566406,
        ],
      },
      {
        modelHash: GetHashKey('polmav'),
        pos: [
          450.3487548828125, -981.34814453125, 44.07944107055664,
          0.22955642640590668, 0.000706415215972811, 89.86830139160156,
          89.86830139160156,
        ],
      }
    );

    this.registerClothingLockerPositions(
      [458.6168518066406, -993.24755859375, 30.689577102661133],
      [456.2479553222656, -988.4548950195312, 30.689579010009766],
      [451.63836669921875, -993.3112182617188, 30.689579010009766]
    );

    this.registerClothingLockerItems(
      ...ItemConstructor.bundle(
        new ItemConstructor(
          this.getLockerItems.bind(this),
          'clothings',
          undefined,
          this.translationLanguage
        ).get()
      )
    );
  }

  @EventListener({ eventName: 'inventory:client-receive-item' })
  public onPlayerReceiveItemFromMenu(item): void {
    const playerId: number = source;

    if (
      this.isPlayerAtClothingLocker(playerId) &&
      this.isPlayerMemberOfThisFaction(playerId) &&
      this.clothingLockerItems.find((_item) => _item.image === item.image)
    ) {
      const clothingRank = Number(item.image.charAt(item.image.length - 1));

      if (
        !isNaN(clothingRank) &&
        global.exports['factions'].getFactionMemberRank(
          this.factionInternalId,
          playerId
        ) < clothingRank
      ) {
        return;
      }

      global.exports['inventory'].givePlayerItem(
        playerId,
        item,
        this.getLockerItems()[item.image]
      );
    }
  }

  @EventListener({ eventName: 'inventory:client-give-to-additional-inventory' })
  public onInventoryItemDraggedIntoLocker(item): void {
    const playerId: number = source;

    if (item.image.includes('policesuit')) {
      global.exports['inventory'].consumePlayerItem(playerId, item, 1);
    }
  }

  private getLockerItems(): object {
    return {
      policesuit: {
        components: {
          3: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 24,
            textureId: 2,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 15,
            textureId: 0,
            paletteId: 0,
          },
          7: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          8: {
            drawableId: 122,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 55,
            textureId: 0,
            paletteId: 0,
          },
          clothingId: 'policesuit',
        },
      },
      policesuit2: {
        components: {
          3: {
            drawableId: 1,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 24,
            textureId: 2,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 97,
            textureId: 0,
            paletteId: 0,
          },
          7: {
            drawableId: 23,
            textureId: 1,
            paletteId: 0,
          },
          8: {
            drawableId: 129,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 316,
            textureId: 0,
            paletteId: 0,
          },
          clothingId: 'policesuit2',
        },
      },
      policesuit3: {
        components: {
          1: {
            drawableId: 52,
            textureId: 0,
            paletteId: 0,
          },
          3: {
            drawableId: 172,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 130,
            textureId: 1,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 24,
            textureId: 0,
            paletteId: 0,
          },
          7: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          8: {
            drawableId: 122,
            textureId: 0,
            paletteId: 0,
          },
          9: {
            drawableId: 16,
            textureId: 2,
            paletteId: 0,
          },
          10: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 49,
            textureId: 0,
            paletteId: 0,
          },
          clothingId: 'policesuit3',
        },
      },
      policesuit5: {
        components: {
          1: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          3: {
            drawableId: 4,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 24,
            textureId: 0,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 10,
            textureId: 0,
            paletteId: 0,
          },
          7: {
            drawableId: 125,
            textureId: 0,
            paletteId: 0,
          },
          8: {
            drawableId: 150,
            textureId: 0,
            paletteId: 0,
          },
          9: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          10: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 29,
            textureId: 0,
            paletteId: 0,
          },
          clothingId: 'policesuit5',
        },
      },
      policesuit6: {
        components: {
          1: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          3: {
            drawableId: 4,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 24,
            textureId: 0,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 10,
            textureId: 0,
            paletteId: 0,
          },
          7: {
            drawableId: 115,
            textureId: 1,
            paletteId: 0,
          },
          8: {
            drawableId: 31,
            textureId: 0,
            paletteId: 0,
          },
          9: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          10: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 29,
            textureId: 0,
            paletteId: 0,
          },
          clothingId: 'policesuit6',
        },
      },
    };
  }
}
