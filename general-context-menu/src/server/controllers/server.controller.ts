import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

@FiveMController()
export class Server extends ServerController {
  @EventListener({ eventName: `${GetCurrentResourceName()}:open-general-menu` })
  public onGeneralMenuOpened(nearestVehicles: number[]) {
    global.exports['armoury-overlay'].showContextMenu(source, {
      title: 'General Menu',
      id: 'general-menu',
      items: [
        {
          label: 'GPS',
          active: true,
        },
        {
          label: 'Legitimation',
        },
        ...(nearestVehicles.length
          ? [
              {
                label: 'Vehicle',
              },
            ]
          : []),
      ],
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
        switch (button.label) {
          case 'Vehicle': {
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
    }
  }
}
