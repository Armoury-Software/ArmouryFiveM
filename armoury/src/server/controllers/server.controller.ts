import { ServerController } from '@core/server/server.controller';
import { Export, FiveMController } from '@core/decorators/armoury.decorators';
import { calculateDistance } from '@core/utils';

@FiveMController()
export class Server extends ServerController {
  protected _players: number[] = [];

  public constructor() {
    super();

    this.registerFiveMEventListeners();
    this.registerExports();
    this.registerTimers();

    SetRoutingBucketPopulationEnabled(0, true);
    this._players = [];

    try {
      global.exports['authentication'].getAuthenticatedPlayers();
    } catch (e) {
      console.error(
        "Attempted to grab the authenticated players into armoury's connected players, but couldn't."
      );
    }
  }

  @Export()
  public isVehicleNearbyPlayer(
    vehicleId: number,
    playerId: number,
    range: number = 3.5
  ): boolean {
    const playerPosition: number[] = GetEntityCoords(
      GetPlayerPed(playerId),
      true
    );
    const vehiclePosition: number[] = GetEntityCoords(vehicleId, true);

    if (
      calculateDistance([
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        vehiclePosition[0],
        vehiclePosition[1],
        vehiclePosition[2],
      ]) <= range
    ) {
      return true;
    }

    return false;
  }

  @Export()
  public getVehiclesStillNearbyFrom(
    playerId: number,
    nearestVehicles: [number, string][]
  ): [number, string][] {
    return nearestVehicles.filter((nearVehicle: [number, string]) =>
      // TODO: Add fallback here if NetworkGetEntityFromNetworkId returns falsy response
      this.isVehicleNearbyPlayer(
        NetworkGetEntityFromNetworkId(nearVehicle[0]),
        playerId
      )
    );
  }

  private registerFiveMEventListeners(): void {
    onNet('playerJoining', (_source: number, _oldId: number) => {
      this.setPlayerVirtualWorld(source, 0);
      this._players.push(source);
    });

    onNet('playerDropped', (_reason: string) => {
      this._players = this._players.filter(
        (player: number) => player !== source
      );
    });
  }

  public getPlayers(): number[] {
    return this._players;
  }

  private registerExports(): void {
    exports('getPlayers', this.getPlayers.bind(this));
  }

  private registerTimers(): void {
    const date: Date = new Date();
    TriggerClientEvent(
      `${GetCurrentResourceName()}:update-time`,
      -1,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    );

    setInterval(() => {
      const date: Date = new Date();
      TriggerClientEvent(
        `${GetCurrentResourceName()}:update-time`,
        -1,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );
    }, 60000);
  }
}
