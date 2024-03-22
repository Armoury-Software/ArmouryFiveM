import { Inject } from 'injection-js';
import {
  Command,
  Controller,
  EventListener,
  Export,
  ServerSessionService,
  ServerVirtualWorldsService,
  LocationUtils,
} from '@armoury/fivem-framework';

@Controller()
export class Server {
  private playersBlockedOnTimes: Map<number, number[]> = new Map();

  public constructor(
    @Inject(ServerSessionService) private readonly _session: ServerSessionService,
    @Inject(ServerVirtualWorldsService) private readonly _virtualWorlds: ServerVirtualWorldsService
  ) {
    this.registerTimers();

    Cfx.Server.SetRoutingBucketPopulationEnabled(0, false);
  }

  @Export()
  public isVehicleNearbyPlayer(vehicleId: number, playerId: number, range: number = 3.5): boolean {
    const playerPosition: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(playerId.toString()));
    const vehiclePosition: number[] = Cfx.Server.GetEntityCoords(vehicleId);

    if (
      LocationUtils.distance(
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        vehiclePosition[0],
        vehiclePosition[1],
        vehiclePosition[2]
      ) <= range
    ) {
      return true;
    }

    return false;
  }

  @Export()
  public getVehiclesStillNearbyFrom(playerId: number, nearestVehicles: [number, string][]): [number, string][] {
    return nearestVehicles.filter((nearVehicle: [number, string]) =>
      // TODO: Add fallback here if NetworkGetEntityFromNetworkId returns falsy response
      this.isVehicleNearbyPlayer(Cfx.Server.NetworkGetEntityFromNetworkId(nearVehicle[0]), playerId)
    );
  }

  @Export()
  public blockPlayerTime(playerId: number, hour: number, minute: number, second: number): void {
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
    const playerId = Cfx.source;
    this._virtualWorlds.setPlayerVirtualWorld(playerId, 0);
    this.updateTimeForPlayers(playerId);
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    const playerId = Cfx.source;
    if (this.playersBlockedOnTimes.has(playerId)) {
      this.playersBlockedOnTimes.delete(playerId);
    }

    this._session.saveCritical(playerId);
    this._session.clearPlayerInfo(playerId);
    Cfx.emit(`${Cfx.Server.GetCurrentResourceName()}:player-logout`, Cfx.source);
  }

  @Command()
  public language(playerId: number, [language]: [string]): void {
    if (language !== 'en' && language !== 'ro') {
      global.exports['chat'].addMessage(playerId, 'Unsupported language.');
      return;
    }

    // this.updatePlayerClientsidedCacheKey(playerId, 'language', language);
  }

  @Command({ adminLevelRequired: 6 })
  public blockMyTime(playerId: number, [hour, minute, second]: [number, number, number]): void {
    this.blockPlayerTime(playerId, Number(hour), Number(minute), Number(second));
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
    if (specificPlayerId || this._session.players.length) {
      (specificPlayerId ? [specificPlayerId] : this._session.players).forEach((playerId: number) => {
        let hour!: number, minute!: number, second!: number;

        if (this.playersBlockedOnTimes.has(playerId)) {
          [hour, minute, second] = this.playersBlockedOnTimes.get(playerId);
        }

        Cfx.TriggerClientEvent(
          `${Cfx.Server.GetCurrentResourceName()}:update-time`,
          playerId,
          hour ?? date.getHours(),
          minute ?? date.getMinutes(),
          second ?? date.getSeconds()
        );
      });
    }
  }
}
