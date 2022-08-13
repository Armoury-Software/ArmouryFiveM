import {
  Command,
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

import { COMPONENT_VARIATION_LIMITS } from '../../../../character-creation/src/server/component.limits';

@FiveMController()
export class Server extends ServerController {
  private playersTestingClothingPairs: Map<number, number[]> = new Map();

  constructor() {
    super();

    this.initializeTables();
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:init-pairs` })
  public async onPairsShouldInitialize(
    page: string,
    _source?: number
  ): Promise<void> {
    const playerId: number = _source ?? source;
    const [componentId, pairComponentId] = page
      .split('_')
      .map((splitPage) => this.getComponentIdByName(splitPage));
    const [drawableId, pairDrawableId] =
      await this.getFirstIncompleteDrawableIdFor(componentId, pairComponentId);

    // prettier-ignore
    SetPedComponentVariation(GetPlayerPed(playerId), componentId, drawableId, 0, 0);
    // prettier-ignore
    SetPedComponentVariation(GetPlayerPed(playerId), pairComponentId, pairDrawableId, 0, 0);

    if (!this.playersTestingClothingPairs.has(playerId)) {
      this.playersTestingClothingPairs.set(playerId, new Array(12).fill(0));
    }

    this.playersTestingClothingPairs.set(
      playerId,
      this.playersTestingClothingPairs.get(playerId).map((_item, index) => {
        if (index === componentId) {
          return drawableId;
        }

        if (index === pairComponentId) {
          return pairDrawableId;
        }

        SetPedComponentVariation(GetPlayerPed(playerId), index, 0, 100, 0);

        return 0;
      })
    );

    TriggerClientEvent(
      `${GetCurrentResourceName()}:update-for-peds`,
      playerId,
      this.playersTestingClothingPairs
        .get(playerId)
        .map((_drawableId, _componentId) =>
          _componentId !== componentId && _componentId !== pairComponentId
            ? -1
            : _drawableId
        )
    );
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:decision-made` })
  public async onDecisionHasBeenMade(
    page: string,
    approved: boolean
  ): Promise<void> {
    const playerId: number = source;
    const [componentId, pairComponentId] = page
      .split('_')
      .map((splitPage) => this.getComponentIdByName(splitPage));

    console.log('onDecisionHasBeenMade: ', componentId, pairComponentId);

    try {
      await global.exports['oxmysql'].insert_async(
        'INSERT INTO `clothing_pairs` (`componentId`, `pairComponentId`, `drawableId`, `pairDrawableId`, `compatible`) VALUES (?, ?, ?, ?, ?)',
        [
          componentId,
          pairComponentId,
          this.playersTestingClothingPairs.get(playerId).at(componentId),
          this.playersTestingClothingPairs.get(playerId).at(pairComponentId),
          approved,
        ]
      );

      this.onPairsShouldInitialize(page, playerId);
    } catch (error) {
      TriggerClientEvent(`${GetCurrentResourceName()}:force-hideui`, playerId);

      global.exports['chat'].addMessage(
        playerId,
        'A aparut o eroare la conexiune, te rog incearca din nou.'
      );
    }
  }

  private async initializeTables(): Promise<void> {
    try {
      await global.exports['oxmysql'].query_async(
        'DESCRIBE clothing_pairs',
        []
      );
    } catch (error) {
      console.error(
        `[${GetCurrentResourceName()}]: Table does not exist. Creating..`
      );

      await global.exports['oxmysql'].query_async(
        'CREATE TABLE `clothing_pairs` ( `componentId` INT NOT NULL, `pairComponentId` INT NOT NULL, `drawableId` INT NOT NULL, `pairDrawableId` INT NOT NULL, `compatible` BOOLEAN NOT NULL ) ENGINE = InnoDB;',
        []
      );

      console.log(
        `[${GetCurrentResourceName()}]: 'clothing-pairs' SQL table has been created!`
      );
    }
  }

  @Command()
  public async beginClothingPairing(source: number): Promise<void> {
    const playerId: number = source;
    TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, playerId, {
      uppershirts_undershirts: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(11, 8),
        max: COMPONENT_VARIATION_LIMITS[11] * COMPONENT_VARIATION_LIMITS[8],
        items: [0, 1, 2, 3],
      },
      uppershirts_accessories: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(11, 7),
        max: COMPONENT_VARIATION_LIMITS[11] * COMPONENT_VARIATION_LIMITS[7],
        items: [0, 1, 2, 3],
      },
      uppershirts_hands: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(11, 3),
        max: COMPONENT_VARIATION_LIMITS[11] * COMPONENT_VARIATION_LIMITS[3],
        items: [0, 1, 2, 3],
      },
      uppershirts_pants: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(11, 4),
        max: COMPONENT_VARIATION_LIMITS[11] * COMPONENT_VARIATION_LIMITS[4],
        items: [0, 1, 2, 3],
      },
      undershirts_accessories: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(8, 7),
        max: COMPONENT_VARIATION_LIMITS[8] * COMPONENT_VARIATION_LIMITS[7],
        items: [0, 1, 2, 3],
      },
      undershirts_pants: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(8, 4),
        max: COMPONENT_VARIATION_LIMITS[8] * COMPONENT_VARIATION_LIMITS[4],
        items: [0, 1, 2, 3],
      },
      pants_shoes: {
        completed: await this.getNumberOfCompletedDrawableIdsFor(4, 6),
        max: COMPONENT_VARIATION_LIMITS[4] * COMPONENT_VARIATION_LIMITS[6],
        items: [0, 1, 2, 3],
      },
    });
  }

  private async getFirstIncompleteDrawableIdFor(
    componentId: number,
    pairComponentId: number
  ): Promise<[number, number] | undefined> {
    const maxDrawableId: number = Number(
      Object.values(
        (
          await global.exports['oxmysql'].query_async(
            `SELECT MAX(drawableId) FROM clothing_pairs WHERE componentId = ${componentId} AND pairComponentId = ${pairComponentId}`,
            []
          )
        )[0]
      ).at(0)
    );

    let maxPairDrawableId: number =
      Number(
        Object.values(
          (
            await global.exports['oxmysql'].query_async(
              `SELECT COUNT(pairDrawableId) FROM clothing_pairs WHERE componentId = ${componentId} AND pairComponentId = ${pairComponentId} AND drawableId = ${maxDrawableId}`,
              []
            )
          )[0]
        ).at(0)
      ) - 1;

    if (maxPairDrawableId < COMPONENT_VARIATION_LIMITS[pairComponentId]) {
      console.log('returned here! (1)', [maxDrawableId, maxPairDrawableId + 1]);
      return [maxDrawableId, maxPairDrawableId + 1];
    }

    if (maxDrawableId < COMPONENT_VARIATION_LIMITS[componentId]) {
      console.log('returned here! (2)', [maxDrawableId + 1, 0]);
      return [maxDrawableId + 1, 0];
    }

    return undefined;
  }

  private async getNumberOfCompletedDrawableIdsFor(
    componentId: number,
    pairComponentId: number
  ): Promise<number> {
    const actualNumber: number = Number(
      Object.values(
        (
          await global.exports['oxmysql'].query_async(
            `SELECT COUNT(pairDrawableId) FROM clothing_pairs WHERE componentId = ${componentId} AND pairComponentId = ${pairComponentId}`,
            []
          )
        )[0]
      ).at(0)
    );

    return actualNumber;
  }

  private getComponentIdByName(name: string): number {
    switch (name) {
      case 'uppershirts': {
        return 11;
      }
      case 'undershirts': {
        return 8;
      }
      case 'accessories': {
        return 7;
      }
      case 'pants': {
        return 4;
      }
      case 'shoes': {
        return 6;
      }
      case 'hands': {
        return 3;
      }
    }
  }
}
