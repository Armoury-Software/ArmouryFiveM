import { ServerController } from '@core/server/server.controller';
import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { calculateDistance } from '@core/utils';

@FiveMController()
export class Server extends ServerController {
  protected _players: number[] = [];
  private playersBlockedOnTimes: Map<number, number[]> = new Map();

  public constructor() {
    super();

    this.registerTimers();

    SetRoutingBucketPopulationEnabled(0, false);
    this._players = [];

    try {
      const authenticatedPlayers: number[] =
        global.exports['authentication'].getAuthenticatedPlayers();

      if (authenticatedPlayers.length) {
        this._players = [...this._players, ...authenticatedPlayers];
      }
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

  @Export()
  public blockPlayerTime(
    playerId: number,
    hour: number,
    minute: number,
    second: number
  ): void {
    this.playersBlockedOnTimes.set(playerId, [hour, minute, second]);
    this.updateTimeForPlayers(playerId);
  }

  @Export()
  public unblockPlayerTime(playerId: number): void {
    if (this.playersBlockedOnTimes.has(playerId)) {
      this.playersBlockedOnTimes.delete(playerId);
    }

    this.updateTimeForPlayers(playerId);
  }

  @EventListener()
  public onPlayerConnect(): void {
    this.setPlayerVirtualWorld(source, 0);
    this.updateTimeForPlayers(source);
    this._players.push(source);
  }

  @Export()
  public getPlayers(): number[] {
    return this._players;
  }

  @Export()
  public isPlayerOnline(playerId: number): boolean {
    return this._players.includes(playerId);
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();

    if (this.playersBlockedOnTimes.has(source)) {
      this.playersBlockedOnTimes.delete(source);
    }

    this._players = this._players.filter((player: number) => player !== source);
  }

  @Command()
  public language(playerId: number, [language]: [string]): void {
    if (language !== 'en' && language !== 'ro') {
      global.exports['chat'].addMessage(playerId, 'Unsupported language.');
      return;
    }

    this.updatePlayerClientsidedCacheKey(playerId, 'language', language);
  }

  @Command({ adminLevelRequired: 6 })
  public blockMyTime(
    playerId: number,
    [hour, minute, second]: [number, number, number]
  ): void {
    this.blockPlayerTime(
      playerId,
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  @Command({ adminLevelRequired: 6 })
  public unblockMyTime(playerId: number): void {
    this.unblockPlayerTime(playerId);
  }

  private registerTimers(): void {
    this.updateTimeForPlayers();
    setInterval(() => {
      this.updateTimeForPlayers();
    }, 60000);
  }

  private updateTimeForPlayers(specificPlayerId?: number): void {
    const date: Date = new Date();
    if (specificPlayerId || this._players.length) {
      (specificPlayerId ? [specificPlayerId] : this._players).forEach(
        (playerId: number) => {
          let hour!: number, minute!: number, second!: number;

          if (this.playersBlockedOnTimes.has(playerId)) {
            [hour, minute, second] = this.playersBlockedOnTimes.get(playerId);
          }

          TriggerClientEvent(
            `${GetCurrentResourceName()}:update-time`,
            playerId,
            hour ?? date.getHours(),
            minute ?? date.getMinutes(),
            second ?? date.getSeconds()
          );
        }
      );
    }
  }
}
