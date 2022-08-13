import { Export, FiveMController } from '@core/decorators/armoury.decorators';
import { ServerDBDependentController } from '@core/server/server-db-dependent.controller';

import { FactionLog } from '@shared/faction-log.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerDBDependentController<FactionLog> {
  @Export()
  public addToFactionLog(factionInternalId: string, content: string): void {
    this.createEntity({
      id: 0,
      timestamp: Date.now(),
      content,
      factionInternalId,
    });
  }

  @Export()
  public async getFactionLogs(
    factionInternalId: string,
    numberOfLogs: number = 10
  ): Promise<FactionLog[]> {
    const logs: FactionLog[] = await global.exports['oxmysql'].query_async(
      `SELECT timestamp, content FROM \`${this.dbTableName}\` WHERE factionInternalId = ? ORDER BY timestamp DESC LIMIT ?`,
      [factionInternalId, numberOfLogs]
    );

    return logs.map((factionLog: FactionLog) => {
      const date = new Date(factionLog.timestamp);
      const currentDate = new Date();
      const dateFormatted: string =
        date.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)
          ? this.translate('today')
          : `${date.getDate()}/${date.getMonth() + 1}/${
              date.getFullYear() % 100
            }`;

      return {
        ...factionLog,
        timestamp: dateFormatted,
      };
    });
  }
}
