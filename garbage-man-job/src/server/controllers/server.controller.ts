import { ServerController } from '@core/server/server.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

let count = 1;
@FiveMController()
export class Server extends ServerController {
  public constructor() {
    super();

    this.assignEvents();
  }
  private assignEvents(): void {
    onNet(`${GetCurrentResourceName()}:start-job`, () => {
      if (count == 1) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: -205.8197784423828,
          Y: 216.94944763183594,
          Z: 86.6871337890625,
        });
        count = 2;
      }
    });
    onNet(`${GetCurrentResourceName()}:cp-reached`, () => {
      if (count == 2) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: -215.5120849609375,
          Y: 271.1736145019531,
          Z: 91.2535400390625,
        });
        count = 3;
      } else if (count == 3) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: -181.9912109375,
          Y: 248.00439453125,
          Z: 92.028564453125,
        });
        count = 4;
      } else if (count == 4) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: -115.89889526367188,
          Y: 217.7142791748047,
          Z: 94.16845703125,
        });
        count = 5;
      } else if (count == 5) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: 143.4857177734375,
          Y: 206.57144165039062,
          Z: 106.16552734375,
        });
        count = 6;
      } else if (count == 6) {
        TriggerClientEvent(`${GetCurrentResourceName()}:begin-job`, source, {
          X: 138.09231567382812,
          Y: 166.1670379638672,
          Z: 104.2109375,
        });
        count = 0;
      } else if (count == 0) {
        TriggerClientEvent(`${GetCurrentResourceName()}:finish-job`, source);
        count = 1;
      }
      exports['authentication'].setPlayerInfo(
        source,
        'cash',
        Number(exports['authentication'].getPlayerInfo(source, 'cash')) +
          (20 + Math.floor(Math.random() * 15)),
        false
      );
      TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source);
    });
    onNet(`${GetCurrentResourceName()}:get-job`, () => {
      global.exports['authentication'].setPlayerInfo(
        source,
        'job',
        'garbageman',
        false
      );
      TriggerClientEvent(`${GetCurrentResourceName()}:job-assigned`, source);
    });
  }
}
