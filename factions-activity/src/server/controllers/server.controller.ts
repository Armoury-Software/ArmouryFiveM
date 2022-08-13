import { Export, FiveMController } from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import { FactionActivity } from '@shared/faction-activity.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerDBDependentController<FactionActivity> {
  private playerDBIdsWithReportTypes: Map<number, string[]> = new Map();

  constructor(dbTableName: string, loadAllAtStart?: boolean) {
    super(dbTableName, loadAllAtStart);

    this.initializeCache();
  }

  @Export()
  public addToFactionActivityFor(
    factionInternalId: string,
    type: string,
    playerDBId: number,
    incrementPoints: number
  ): void {
    if (
      !this.playerDBIdsWithReportTypes.has(playerDBId) ||
      !this.playerDBIdsWithReportTypes.get(playerDBId).includes(type)
    ) {
      this.createEntity({
        id: 0,
        timestamp: Date.now(),
        points: incrementPoints,
        playerDBId,
        type,
        factionInternalId,
      });

      this.playerDBIdsWithReportTypes.set(playerDBId, [
        ...(this.playerDBIdsWithReportTypes.has(playerDBId)
          ? this.playerDBIdsWithReportTypes.get(playerDBId)
          : []),
        type,
      ]);
    } else {
      global.exports['oxmysql'].update_async(
        `UPDATE \`${this.dbTableName}\` SET points = points + ?, timestamp = ? WHERE playerDBId = ? AND type = ? AND factionInternalId = ?`,
        [incrementPoints, Date.now(), playerDBId, type, factionInternalId]
      );
    }
  }

  @Export()
  public async getFactionActivityForMultipleAsync(
    factionInternalId: string,
    playerDBIds: number[],
    type?: string
  ): Promise<{ [key: number]: FactionActivity[] }> {
    const logs: {
      playerDBId: number;
      timestamps: string;
      types: string;
      points: string;
    }[] = await global.exports['oxmysql'].query_async(
      `SELECT
        playerDBId,
        GROUP_CONCAT(timestamp ORDER BY CAST(SUBSTRING_INDEX(type, '-', -1) AS UNSIGNED)) AS timestamps,
        GROUP_CONCAT(type ORDER BY CAST(SUBSTRING_INDEX(type, '-', -1) AS UNSIGNED)) AS types,
        GROUP_CONCAT(points ORDER BY CAST(SUBSTRING_INDEX(type, '-', -1) AS UNSIGNED)) AS points
        FROM ${this.dbTableName}
        WHERE factionInternalId = ?
        AND (${playerDBIds
          .map((playerDBId) => 'playerDBId=' + playerDBId)
          .join(' OR ')})
        GROUP BY playerDBId
        ORDER BY playerDBId`,
      [factionInternalId]
    );

    if (logs) {
      return logs.reduce(
        (previous, current) => ({
          ...previous,
          [current.playerDBId]: current.timestamps
            .split(',')
            .map((timestamp, index) => ({
              id: 0,
              factionInternalId,
              type: current.types.split(',')[index],
              timestamp,
              playerDBId: current.playerDBId,
              points: Number(current.points.split(',')[index]),
            })),
        }),
        {}
      );
    }

    return {};
  }

  @Export()
  public async getFactionActivityForAsync(
    factionInternalId: string,
    playerDBId: number
  ): Promise<FactionActivity[]> {
    return await this.getFactionActivityForMultipleAsync(factionInternalId, [playerDBId])?.[playerDBId] || [];
  }

  private async initializeCache(): Promise<void> {
    const today = new Date();
    const day = today.getDay() || 7;
    today.setHours(day !== 1 ? -24 * (day - 1) : 0, 0, 0, 0);

    await global.exports['oxmysql'].query_async(
      `DELETE FROM factions_activity WHERE timestamp < ?`,
      [today.valueOf()]
    );

    const cache: { playerDBId: number; types: string }[] = await global.exports[
      'oxmysql'
    ].query_async(
      `SELECT playerDBId, GROUP_CONCAT(type ORDER BY CAST(SUBSTRING_INDEX(type, '-', -1) AS UNSIGNED)) AS types FROM ${this.dbTableName} GROUP BY playerDBId ORDER BY playerDBId`
    );

    cache.forEach((cacheItem) => {
      this.playerDBIdsWithReportTypes.set(
        cacheItem.playerDBId,
        cacheItem.types.split(',')
      );
    });
  }
}
