import { ClientWithUIController } from '@core/client/client-ui.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';
import { Delay } from '@core/utils';

@FiveMController()
export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.registerKeyBindings();
    this.assignListeners();

    this.addUIListener('inventory-item-dropped');
    this.addUIListener('inventory-item-clicked');
    this.addUIListener('transfer-confirm');
    this.addUIListener('trade-confirm');

    // this.addDebugPeds();
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    this.removeFromTick(`${GetCurrentResourceName()}_inventorygive`);
  }

  public onForceShowUI(data: any): void {
    super.onForceShowUI(data);
    this.showInventoryUI(data);
  }

  private showInventoryUI(data: any): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        items: JSON.stringify(data.items),
        ...(data.additionalPanel
          ? {
              additionalPanel: JSON.stringify(data.additionalPanel),
            }
          : {}),
      })
    );

    this.addToTickUnique({
      id: `${GetCurrentResourceName()}_inventorygive`,
      function: () => {
        this.showClosestPedsICanOfferTo();
      },
    });
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    switch (eventName) {
      case 'inventory-item-dropped': {
        if (eventData.wasDraggedFromAdditionalInventoryIntoMine) {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:client-receive-item`,
            eventData.item
          );
        }

        if (eventData.wasDraggedFromMyInventoryIntoAdditionalInventory) {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:client-give-to-additional-inventory`,
            eventData.item
          );
        }
        break;
      }
      case 'transfer-confirm': {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:client-confirm-purchase`,
          eventData
        );
        break;
      }
      case 'trade-confirm': {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:client-confirm-trade`,
          eventData
        );
        break;
      }
      case 'inventory-item-clicked': {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:inventory-item-clicked`,
          eventData
        );
        break;
      }
    }
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+inventory',
      () => {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:client-inventory-request`,
          undefined,
          ''
        );
      },
      false
    );

    RegisterKeyMapping('+inventory', 'Open inventory', 'keyboard', 'i');
  }

  private addDebugPeds(): void {
    this.createPedAsync(
      0,
      GetHashKey('a_f_m_downtown_01'),
      123.2835,
      -2667.7188,
      5.9934,
      0,
      true,
      true
    );

    this.createPedAsync(
      0,
      GetHashKey('a_f_y_femaleagent'),
      120.2769,
      -2671.6353,
      5.9934,
      0,
      true,
      true
    );

    this.createPedAsync(
      0,
      GetHashKey('a_f_m_prolhost_01'),
      124.1934,
      -2663.5913,
      5.9934,
      0,
      true,
      true
    );
  }

  private async draw(x, y, z) {
    let [visible, x1, y1] = GetScreenCoordFromWorldCoord(x, y, z);

    if (visible) {
      if (!HasStreamedTextureDictLoaded('inventorysprites')) {
        RequestStreamedTextureDict('inventorysprites', true);

        while (!HasStreamedTextureDictLoaded('inventorysprites')) {
          await Delay(100);
        }
      } else {
        const cursorPosition: number[] = GetNuiCursorPosition();
        const realScreenPosition: number[] =
          this.getRealScreenCoordsFromOffsets(x1, y1);

        if (
          Math.abs(cursorPosition[0] - realScreenPosition[0]) < 36 &&
          Math.abs(cursorPosition[1] - realScreenPosition[1]) < 36
        ) {
          DrawSprite(
            'inventorysprites',
            'inventory-give-selected',
            x1,
            y1,
            0.08,
            0.14,
            0,
            255,
            255,
            255,
            255
          );
        } else {
          DrawSprite(
            'inventorysprites',
            'inventory-give',
            x1,
            y1,
            0.08,
            0.14,
            0,
            255,
            255,
            255,
            255
          );
        }
      }
    }
  }

  private showClosestPedsICanOfferTo(): void {
    let [handle, _entity]: [number, number] = FindFirstPed(0);

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = FindNextObject(handle);
      found = f;

      if (entity !== PlayerPedId()) {
        let coords = GetEntityCoords(entity, true);
        this.draw(coords[0], coords[1], coords[2]);
      }
    }

    EndFindObject(handle);
  }

  private getRealScreenCoordsFromOffsets(
    X: number,
    Y: number
  ): [number, number] {
    const screenResolution: [number, number] = GetActiveScreenResolution();
    return [screenResolution[0] * X, screenResolution[1] * Y];
  }

  private assignListeners(): void {
    onNet(`${GetCurrentResourceName()}:cshow-purchase-dialog`, (data) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'show-purchase-dialog',
          myMoney: data.myMoney,
          item: data.item,
        })
      );
    });

    onNet(`${GetCurrentResourceName()}:cshow-trade-dialog`, (data) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'show-trade-dialog',
          item: data.item,
        })
      );
    });
  }
}
