import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { EVENT_DIRECTIONS } from '@core/decorators/event.directions';

@FiveMController()
export class Client extends ClientController {
  private menuToggles: Map<string, boolean> = new Map<string, boolean>();

  public constructor() {
    super();

    this.registerKeyBindings();
  }

  @EventListener({ direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onContextMenuItemPressed(data: any) {
    TriggerServerEvent(
      `${GetCurrentResourceName()}:general-menu-item-press`,
      data.menuId,
      {
        label: data.buttonSelected.label,
        metadata: data.buttonSelected.metadata,
      },
      data.metadata || {},
      global.exports['armoury'].findNearVehicles()
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:refresh-menu-toggle`,
  })
  public onMenuToggleRefreshed(key: string): void {
    this.menuToggles.set(key, false);
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+opengeneralmenu',
      () => {
        if (this.menuToggles.get('general-menu') === true) {
          this.menuToggles.set('general-menu', false);
          return;
        }

        TriggerServerEvent(
          `${GetCurrentResourceName()}:open-general-menu`,
          global.exports['armoury'].findNearVehicles()
        );
        this.menuToggles.set('general-menu', true);
      },
      false
    );

    RegisterKeyMapping(
      '+opengeneralmenu',
      'Open General Menu',
      'keyboard',
      'k'
    );
  }
}
