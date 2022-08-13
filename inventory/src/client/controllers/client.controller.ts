import { ClientWithUIController } from '@core/client/client-ui.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { Delay } from '@core/utils';
import { OPTIONS } from '@shared/options';
import { TradeInstance } from '@shared/trade.interface';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientWithUIController {
  private selectedPeds: number[] = [];
  private cachedTradeInstances: (TradeInstance & {
    beginningTimestamp?: number;
  })[] = [];
  private cachedTimeouts: Map<string, NodeJS.Timeout> = new Map();

  public constructor() {
    super();

    this.registerKeyBindings();

    this.addUIListener('inventory-item-dropped');
    this.addUIListener('inventory-item-clicked');
    this.addUIListener('transfer-confirm');
    this.addUIListener('trade-confirm');
    this.addUIListener('trade-decision-made');
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    this.removeFromTick(`${GetCurrentResourceName()}_inventorygive`);
  }

  public onForceShowUI(data: any): void {
    if (!data.onlyIfAlreadyOpen || this.isUIShowing()) {
      super.onForceShowUI(data);
      this.showInventoryUI(data);
    }
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
        language: this.translationLanguage,
        i18n: JSON.stringify(i18n[this.translationLanguage]),
        tradeInstances: this.cachedTradeInstances.map((tradeInstance) => ({
          ...tradeInstance,
          items: [
            ...tradeInstance.items.map((_item) => ({
              ..._item,
              paragraphTitle: this.translate('trade_pending'),
            })),
          ],
          timeRemaining:
            (tradeInstance.beginningTimestamp +
              OPTIONS.MAX_TRADE_TIME * 1000 -
              Date.now()) /
            1000,
        })),
      })
    );

    this.addToTickUnique({
      id: `${GetCurrentResourceName()}_inventorygive`,
      function: () => {
        this.showClosestPedsICanOfferTo();
      },
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:client-show-trade-notification`,
  })
  public onClientShouldReceiveTradeNotification(
    tradeInstance: TradeInstance
  ): void {
    if (this.isUIShowing()) {
      SendNuiMessage(
        JSON.stringify({
          type: 'add-trade-instance',
          tradeInstance: {
            ...tradeInstance,
            items: tradeInstance.items.map((item) => ({
              ...item,
              paragraphTitle: this.translate('trade_pending'),
            })),
          },
        })
      );
    } else {
      this.addToFeed(4000, this.translate('trade_request_received'));
    }

    this.cachedTradeInstances = [
      ...this.cachedTradeInstances.filter(
        (_tradeInstance) => _tradeInstance.tradeId !== tradeInstance.tradeId
      ),
      {
        ...tradeInstance,
        beginningTimestamp: Date.now(),
      },
    ];

    if (this.cachedTimeouts.has(tradeInstance.tradeId)) {
      clearTimeout(this.cachedTimeouts.get(tradeInstance.tradeId));
      this.cachedTimeouts.delete(tradeInstance.tradeId);
    }

    this.cachedTimeouts.set(
      tradeInstance.tradeId,
      setTimeout(() => {
        this.sendTradeDecision({ ...tradeInstance, result: 'reject' });
      }, (OPTIONS.MAX_TRADE_TIME + 2) * 1000)
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:cshow-purchase-dialog`,
  })
  public onShouldShowPurchaseDialog(data): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'show-purchase-dialog',
        myMoney: data.myMoney,
        item: data.item,
      })
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:cshow-trade-dialog`,
  })
  public onShouldShowTradeDialog(data): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'show-trade-dialog',
        item: data.item,
      })
    );
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

        if (eventData.wasDroppedOutside) {
          if (eventData.wasDraggedFromMyInventoryIntoAdditionalInventory) {
            TriggerServerEvent(
              `${GetCurrentResourceName()}:client-give-to-additional-inventory`,
              eventData.item
            );
          } else {
            if (this.selectedPeds.length) {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:client-request-trade`,
                NetworkGetNetworkIdFromEntity(this.selectedPeds[0]),
                eventData.item
              );
              /*TriggerServerEvent(
                `${GetCurrentResourceName()}:client-begin-trade-with-player`,
                NetworkGetNetworkIdFromEntity(this.selectedPeds[0]), // TODO: Replace [0] with closest player
                eventData.item
              );*/
            }
          }
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
      case 'trade-decision-made': {
        this.sendTradeDecision(eventData);
        break;
      }
    }
  }

  private sendTradeDecision(
    tradeInstance: TradeInstance & { result: 'accept' | 'reject' | 'block' }
  ): void {
    this.cachedTradeInstances = [
      ...this.cachedTradeInstances.filter(
        (_tradeInstance) => _tradeInstance.tradeId !== tradeInstance.tradeId
      ),
    ];

    if (this.cachedTimeouts.has(tradeInstance.tradeId)) {
      clearTimeout(this.cachedTimeouts.get(tradeInstance.tradeId));
      this.cachedTimeouts.delete(tradeInstance.tradeId);
    }

    TriggerServerEvent(
      `${GetCurrentResourceName()}:client-responded-to-trade`,
      tradeInstance
    );
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

  private async draw(x, y, z, ped) {
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
          // prettier-ignore
          DrawSprite('inventorysprites', 'inventory-give-selected', x1, y1, 0.08, 0.14, 0, 255, 255, 255, 255);

          if (!this.selectedPeds.includes(ped)) {
            this.selectedPeds.push(ped);
          }
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
    const [x, y, z] = GetEntityCoords(PlayerPedId(), true);

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = FindNextObject(handle);
      found = f;

      if (entity !== GetPlayerPed(-1)) {
        let coords = GetEntityCoords(entity, true);
        if (
          GetDistanceBetweenCoords(
            x,
            y,
            z,
            coords[0],
            coords[1],
            coords[2],
            true
          ) < 4.0
        ) {
          this.draw(coords[0], coords[1], coords[2], entity);
        }
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
}
