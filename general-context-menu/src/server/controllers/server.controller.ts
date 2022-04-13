import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';
import { toThousandsString } from '@core/utils';

@FiveMController()
export class Server extends ServerController {
  private cachedButtonsToAdd: Map<number, { label: string; metadata?: any }[]> =
    new Map();

  @EventListener({ eventName: `${GetCurrentResourceName()}:open-general-menu` })
  public onGeneralMenuOpened(nearestVehicles: number[]) {
    global.exports['armoury-overlay'].showContextMenu(source, {
      title: 'General Menu',
      id: 'general-menu',
      items: [
        ...(this.cachedButtonsToAdd.has(source)
          ? this.cachedButtonsToAdd.get(source)
          : []),
        {
          label: 'GPS',
          metadata: {
            buttonId: 'gps',
          },
        },
        {
          label: 'Legitimation',
          metadata: {
            buttonId: 'legitimation',
          },
        },
        {
          label: 'Job',
        },
        ...(nearestVehicles.length
          ? [
              {
                label: 'Vehicle',
                metadata: {
                  buttonId: 'vehicle',
                },
              },
            ]
          : []),
      ].map((item, index) => ({ ...item, active: index === 0 })),
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:general-menu-item-press`,
  })
  public onGeneralMenuItemPress(
    menuId: string,
    button: { label: string; metadata?: any },
    menuMetadata: any,
    nearestVehicles: [number, string][]
  ) {
    switch (menuId) {
      case 'general-menu': {
        switch (button?.metadata?.buttonId) {
          case 'vehicle': {
            const vehiclesStillNearby: [number, string][] = global.exports[
              'armoury'
            ].getVehiclesStillNearbyFrom(source, nearestVehicles);

            global.exports['armoury-overlay'].showContextMenu(source, {
              title: 'General Menu: Vehicle',
              id: 'general-menu-vehicle',
              items: vehiclesStillNearby.map(
                (vehicle: [number, string], index: number) => ({
                  active: index === 0,
                  // TODO: Use this pattern: Your vehicle: '(Yours) Toyota Prado' / 'Toyota Prado (NRPLATE)'
                  label: vehicle[1],
                  metadata: { vehicleNetworkId: vehicle[0] },
                })
              ),
            });
            break;
          }
          case 'Job': {
            global.exports['armoury-overlay'].showContextMenu(source, {
              title: 'General Menu: Job',
              id: 'general-menu-job',
              items: [
                {
                  label: 'Stop Job',
                  active: true,
                },
              ],
            });
          }
          case 'taxi-driver': {
            this.showTaxiDriverMenu(source, button.metadata.vehicleNetworkId);
            break;
          }
        }
        break;
      }
      case 'taxi-menu': {
        if (button.metadata.buttonId === 'stop-working') {
          global.exports['factions-taxi'].stopPlayerDuty(source);
          return;
        }

        const vehicleId: number = NetworkGetEntityFromNetworkId(
          button.metadata.vehicleNetworkId
        );

        if (
          DoesEntityExist(vehicleId) &&
          GetEntityType(vehicleId) === 2 &&
          GetPedInVehicleSeat(vehicleId, -1) === GetPlayerPed(source)
        ) {
          switch (button?.metadata?.buttonId) {
            case 'start-working': {
              global.exports['factions-taxi'].startPlayerDuty(source);
              this.showTaxiDriverMenu(source, button.metadata.vehicleNetworkId);
              break;
            }
            case 'start-taximeter': {
              global.exports['factions-taxi'].startPlayerRide(source);
              this.showTaxiDriverMenu(source, button.metadata.vehicleNetworkId);
              break;
            }
            case 'stop-taximeter': {
              global.exports['factions-taxi'].stopPlayerRide(source);
              this.showTaxiDriverMenu(source, button.metadata.vehicleNetworkId);
              break;
            }
            case 'adjust-fare': {
              this.showTaxiDriverFareMenu(
                source,
                button.metadata.vehicleNetworkId
              );
            }
          }
        } else {
          this.forceClose(source);
        }

        break;
      }
      case 'taxi-menu-fare': {
        const vehicleId: number = NetworkGetEntityFromNetworkId(
          button.metadata.vehicleNetworkId
        );

        if (
          DoesEntityExist(vehicleId) &&
          GetEntityType(vehicleId) === 2 &&
          GetPedInVehicleSeat(vehicleId, -1) === GetPlayerPed(source)
        ) {
          switch (button?.metadata?.buttonId) {
            case 'raise-to-max': {
              global.exports['factions-taxi'].setPlayerFare(
                source,
                global.exports['factions-taxi'].getMaxFare()
              );
              break;
            }
            case 'raise-by-25': {
              global.exports['factions-taxi'].setPlayerFare(
                source,
                global.exports['factions-taxi'].getPlayerFareCached(source) *
                  1.25
              );
              break;
            }
            case 'lower-by-25': {
              global.exports['factions-taxi'].setPlayerFare(
                source,
                global.exports['factions-taxi'].getPlayerFareCached(source) *
                  0.75
              );
              break;
            }
            case 'lower-to-min': {
              global.exports['factions-taxi'].setPlayerFare(
                source,
                global.exports['factions-taxi'].getMinFare()
              );
              break;
            }
          }
          this.showTaxiDriverFareMenu(source, button.metadata.vehicleNetworkId);
        } else {
          this.forceClose(source);
        }

        break;
      }
      case 'general-menu-vehicle': {
        if (!button.metadata?.vehicleNetworkId) {
          return;
        }

        if (
          global.exports['armoury'].isVehicleNearbyPlayer(
            NetworkGetEntityFromNetworkId(button.metadata?.vehicleNetworkId),
            source
          )
        ) {
          global.exports['armoury-overlay'].showContextMenu(source, {
            title: 'General Menu: Vehicle',
            id: 'general-menu-vehicle-single',
            items: [
              {
                label: 'Check trunk',
                active: true,
                metadata: {
                  id: 'check-trunk',
                },
              },
              {
                label: 'Open trunk',
                metadata: {
                  id: 'open-trunk',
                },
              },
              {
                label: 'Close trunk',
                metadata: {
                  id: 'close-trunk',
                },
              },
            ],
            metadata: {
              vehicleNetworkId: button.metadata?.vehicleNetworkId,
            },
          });
        }
      }
      case 'general-menu-vehicle-single': {
        if (!menuMetadata?.vehicleNetworkId || !button.metadata?.id) {
          return;
        }

        if (
          global.exports['armoury'].isVehicleNearbyPlayer(
            NetworkGetEntityFromNetworkId(menuMetadata?.vehicleNetworkId),
            source
          )
        ) {
          switch (button.metadata?.id) {
            case 'check-trunk': {
              emit(
                'trunk:inspect-trunk',
                source,
                menuMetadata?.vehicleNetworkId
              );
              break;
            }
            case 'open-trunk': {
              // TODO: Add checks - Is the vehicle locked? Is the player the owner of the vehicle?
              TriggerClientEvent(
                'trunk:open-trunk',
                source,
                menuMetadata?.vehicleNetworkId
              );
              break;
            }
            case 'close-trunk': {
              // TODO: Add checks - Is the vehicle locked? Is the player the owner of the vehicle?
              TriggerClientEvent(
                'trunk:close-trunk',
                source,
                menuMetadata?.vehicleNetworkId
              );
              break;
            }
          }
        }
      }
      case 'general-menu-job': {
        switch (button.label) {
          case 'Stop Job': {
            TriggerEvent(
              `job-${global.exports['authentication'].getPlayerInfo(
                source,
                'job'
              )}:cancel-job`,
              source
            );
            break;
          }
        }
      }
    }
  }

  private showTaxiDriverFareMenu(
    playerId: number,
    vehicleNetworkId: number
  ): void {
    const vehicleId: number = NetworkGetEntityFromNetworkId(vehicleNetworkId);

    if (
      DoesEntityExist(vehicleId) &&
      GetEntityType(vehicleId) === 2 &&
      GetPedInVehicleSeat(vehicleId, -1) === GetPlayerPed(playerId)
    ) {
      const playerCachedFare: number =
        global.exports['factions-taxi'].getPlayerFareCached(playerId);
      const maxFare: number = global.exports['factions-taxi'].getMaxFare();
      const minFare: number = global.exports['factions-taxi'].getMinFare();

      global.exports['armoury-overlay'].showContextMenu(playerId, {
        title: `Taxi Menu (Fare: $${toThousandsString(
          global.exports['factions-taxi'].getPlayerFareCached(playerId)
        )})`,
        id: 'taxi-menu-fare',
        items: [
          ...(playerCachedFare < maxFare
            ? [
                {
                  label: `Raise to max ($${maxFare})`,
                  metadata: {
                    buttonId: 'raise-to-max',
                    vehicleNetworkId: NetworkGetNetworkIdFromEntity(vehicleId),
                  },
                },
              ]
            : []),
          ...(playerCachedFare < maxFare * 0.75
            ? [
                {
                  label: `Raise by 25% ($${Math.floor(
                    playerCachedFare * 1.25
                  )})`,
                  metadata: {
                    buttonId: 'raise-by-25',
                    vehicleNetworkId: NetworkGetNetworkIdFromEntity(vehicleId),
                  },
                },
              ]
            : []),
          ...(playerCachedFare > minFare * 1.25
            ? [
                {
                  label: `Lower by 25% ($${Math.floor(
                    playerCachedFare * 0.75
                  )})`,
                  metadata: {
                    buttonId: 'lower-by-25',
                    vehicleNetworkId: NetworkGetNetworkIdFromEntity(vehicleId),
                  },
                },
              ]
            : []),
          ...(playerCachedFare > minFare
            ? [
                {
                  label: `Lower to min ($${minFare})`,
                  metadata: {
                    buttonId: 'lower-to-min',
                    vehicleNetworkId: NetworkGetNetworkIdFromEntity(vehicleId),
                  },
                },
              ]
            : []),
        ].map((item, index) => ({ ...item, active: index === 0 })),
      });
    } else {
      this.forceClose(playerId);
      return;
    }
  }

  private showTaxiDriverMenu(playerId: number, vehicleNetworkId: number): void {
    const vehicleId: number = NetworkGetEntityFromNetworkId(vehicleNetworkId);

    if (
      DoesEntityExist(vehicleId) &&
      GetEntityType(vehicleId) === 2 &&
      GetPedInVehicleSeat(vehicleId, -1) === GetPlayerPed(playerId)
    ) {
      const isAlreadyOnDuty: boolean =
        global.exports['factions-taxi'].isPlayerOnDuty(playerId);
      const taximeterAlreadyOpen: boolean =
        global.exports['factions-taxi'].isPlayerBusyWithRide(playerId);

      global.exports['armoury-overlay'].showContextMenu(playerId, {
        title: `Taxi Menu (Fare: $${toThousandsString(
          global.exports['factions-taxi'].getPlayerFareCached(playerId)
        )})`,
        id: 'taxi-menu',
        items: [
          ...(!isAlreadyOnDuty
            ? [
                {
                  label: 'Start working',
                  metadata: {
                    buttonId: 'start-working',
                    vehicleNetworkId,
                  },
                },
              ]
            : []),
          ...(isAlreadyOnDuty
            ? [
                {
                  label: `${taximeterAlreadyOpen ? 'Stop' : 'Start'} taximeter`,
                  metadata: {
                    buttonId: `${
                      taximeterAlreadyOpen ? 'stop' : 'start'
                    }-taximeter`,
                    vehicleNetworkId,
                  },
                },
              ]
            : []),
          {
            label: 'Adjust fare',
            metadata: {
              buttonId: 'adjust-fare',
              vehicleNetworkId,
            },
          },
          ...(isAlreadyOnDuty
            ? [
                {
                  label: 'Stop working',
                  metadata: {
                    buttonId: 'stop-working',
                    vehicleNetworkId,
                  },
                },
              ]
            : []),
        ].map((item, index) => ({ ...item, active: index === 0 })),
      });
    } else {
      this.forceClose(playerId);
      return;
    }
  }

  private forceClose(playerId: number): void {
    global.exports['armoury-overlay'].hideContextMenu(playerId);
    TriggerClientEvent(
      `${GetCurrentResourceName()}:refresh-menu-toggle`,
      playerId,
      'general-menu'
    );
  }

  @Export()
  public addCachedButton(
    forPlayerId: number,
    button: { label: string; metadata?: any }
  ): void {
    let currentCachedButtonsToAdd = this.cachedButtonsToAdd.has(forPlayerId)
      ? this.cachedButtonsToAdd.get(forPlayerId)
      : [];
    currentCachedButtonsToAdd = [
      ...currentCachedButtonsToAdd.filter(
        (_button) => _button?.metadata?.buttonId !== button?.metadata?.buttonId
      ),
      button,
    ];

    this.cachedButtonsToAdd.set(forPlayerId, currentCachedButtonsToAdd);
  }

  @Export()
  public removeCachedButton(
    forPlayerId: number,
    metadataButtonId: string
  ): void {
    let currentCachedButtonsToAdd = this.cachedButtonsToAdd.has(forPlayerId)
      ? this.cachedButtonsToAdd.get(forPlayerId)
      : [];
    currentCachedButtonsToAdd = currentCachedButtonsToAdd.filter(
      (_button) => _button?.metadata?.buttonId !== metadataButtonId
    );

    if (!currentCachedButtonsToAdd.length) {
      this.cachedButtonsToAdd.delete(forPlayerId);
      return;
    }

    this.cachedButtonsToAdd.set(forPlayerId, currentCachedButtonsToAdd);
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    if (this.cachedButtonsToAdd.has(source)) {
      this.cachedButtonsToAdd.delete(source);
    }
  }
}
