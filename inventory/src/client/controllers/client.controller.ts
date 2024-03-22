import { Inject } from 'injection-js';
import {
  Controller,
  Command,
  KeyBinding,
  ClientTicksService,
  ClientUIService,
  ClientHudService,
  ClientTranslateService,
} from '@armoury/fivem-framework';

@Controller()
export class Client {
  // private selectedPeds: number[] = [];
  // private cachedTradeInstances: (TradeInstance & {
  //   beginningTimestamp?: number;
  // })[] = [];
  // private cachedTimeouts: Map<string, NodeJS.Timeout> = new Map();
  //
  public constructor(
    @Inject(ClientTicksService) private _ticks: ClientTicksService,
    @Inject(ClientUIService) private _ui: ClientUIService,
    @Inject(ClientHudService) private _hud: ClientHudService,
    @Inject(ClientTranslateService) private _translate: ClientTranslateService
  ) {
    this._ui.onShow$.subscribe(this.onForceShowUI.bind(this));
    this._ui.onHide$.subscribe(this.onForceHideUI.bind(this));
  }

  public onForceHideUI(): void {
    console.log('onHide$ called!');
    this._ticks.remove(`${Cfx.Client.GetCurrentResourceName()}_inventorygive`);
  }

  public onForceShowUI(data: any): void {
    if (!data.onlyIfAlreadyOpen || this._ui.visible) {
      Cfx.Client.SendNuiMessage(
        JSON.stringify({
          type: 'update',
          resource: Cfx.Client.GetCurrentResourceName(),
          items: JSON.stringify(data.items),
          ...(data.additionalPanel
            ? {
                additionalPanel: JSON.stringify(data.additionalPanel),
              }
            : {}),
          language: this._translate.language,
          i18n: JSON.stringify(this._translate['_translations'][this._translate.language]),
          tradeInstances: [] /*this.cachedTradeInstances.map((tradeInstance) => ({
            ...tradeInstance,
            items: [
              ...tradeInstance.items.map((_item) => ({
                ..._item,
                paragraphTitle: this._translate.instant('trade_pending'),
              })),
            ],
            timeRemaining: (tradeInstance.beginningTimestamp + OPTIONS.MAX_TRADE_TIME * 1000 - Date.now()) / 1000,
          }))*/,
        })
      );

      // this._ticks.addUnique({
      //   id: `${Cfx.Client.GetCurrentResourceName()}_inventorygive`,
      //   function: () => {
      //     this.showClosestPedsICanOfferTo();
      //   },
      // });
    }
  }
  //
  // // @EventListener({
  // //     eventName: `${Cfx.Client.GetCurrentResourceName()}:client-show-trade-notification`,
  // // })
  // // public onClientShouldReceiveTradeNotification(tradeInstance: TradeInstance): void {
  // //     if (this._ui.visible) {
  // //         Cfx.Client.SendNuiMessage(
  // //             JSON.stringify({
  // //                 type: 'add-trade-instance',
  // //                 tradeInstance: {
  // //                     ...tradeInstance,
  // //                     items: tradeInstance.items.map((item) => ({
  // //                         ...item,
  // //                         paragraphTitle: this._translate.instant('trade_pending'),
  // //                     })),
  // //                 },
  // //             })
  // //         );
  // //     } else {
  // //         this._hud.addToFeed(4000, this._translate.instant('trade_request_received'));
  // //     }
  // //
  // //     this.cachedTradeInstances = [
  // //         ...this.cachedTradeInstances.filter((_tradeInstance) => _tradeInstance.tradeId !== tradeInstance.tradeId),
  // //         {
  // //             ...tradeInstance,
  // //             beginningTimestamp: Date.now(),
  // //         },
  // //     ];
  // //
  // //     if (this.cachedTimeouts.has(tradeInstance.tradeId)) {
  // //         clearTimeout(this.cachedTimeouts.get(tradeInstance.tradeId));
  // //         this.cachedTimeouts.delete(tradeInstance.tradeId);
  // //     }
  // //
  // //     this.cachedTimeouts.set(
  // //         tradeInstance.tradeId,
  // //         setTimeout(() => {
  // //             this.sendTradeDecision({ ...tradeInstance, result: 'reject' });
  // //         }, (OPTIONS.MAX_TRADE_TIME + 2) * 1000)
  // //     );
  // // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Client.GetCurrentResourceName()}:cshow-purchase-dialog`,
  // })
  // public onShouldShowPurchaseDialog(data): void {
  //   Cfx.Client.SendNuiMessage(
  //     JSON.stringify({
  //       type: 'show-purchase-dialog',
  //       myMoney: data.myMoney,
  //       item: data.item,
  //     })
  //   );
  // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Client.GetCurrentResourceName()}:cshow-trade-dialog`,
  // })
  // public onShouldShowTradeDialog(data): void {
  //   Cfx.Client.SendNuiMessage(
  //     JSON.stringify({
  //       type: 'show-trade-dialog',
  //       item: data.item,
  //     })
  //   );
  // }
  //
  // @UIListener({ eventName: 'inventory-item-dropped' })
  // public onInventoryItemDropped(eventData: any) {
  //   if (eventData.wasDraggedFromAdditionalInventoryIntoMine) {
  //     Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:client-receive-item`, eventData.item);
  //   }
  //
  //   if (eventData.wasDroppedOutside) {
  //     if (eventData.wasDraggedFromMyInventoryIntoAdditionalInventory) {
  //       Cfx.TriggerServerEvent(
  //         `${Cfx.Client.GetCurrentResourceName()}:client-give-to-additional-inventory`,
  //         eventData.item
  //       );
  //     } else {
  //       if (this.selectedPeds.length) {
  //         Cfx.TriggerServerEvent(
  //           `${Cfx.Client.GetCurrentResourceName()}:client-request-trade`,
  //           Cfx.Client.NetworkGetNetworkIdFromEntity(this.selectedPeds[0]),
  //           eventData.item
  //         );
  //         /*TriggerServerEvent(
  //                               `${GetCurrentResourceName()}:client-begin-trade-with-player`,
  //                               NetworkGetNetworkIdFromEntity(this.selectedPeds[0]), // TODO: Replace [0] with closest player
  //                               eventData.item
  //                             );*/
  //       }
  //     }
  //   }
  // }
  //
  // @UIListener({ eventName: 'inventory-item-clicked' })
  // public onInventoryItemClicked(eventData: any) {
  //   Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:inventory-item-clicked`, eventData);
  // }
  //
  // @UIListener({ eventName: 'transfer-confirm' })
  // public onTransferConfirm(eventData: any) {
  //   Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:client-confirm-purchase`, eventData);
  // }
  //
  // @UIListener({ eventName: 'trade-confirm' })
  // public onTradeConfirm(eventData: any) {
  //   Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:client-confirm-trade`, eventData);
  // }
  //
  // @UIListener({ eventName: 'trade-decision-made' })
  // public onTradeDecisionMade(tradeInstance: TradeInstance & { result: 'accept' | 'reject' | 'block' }) {
  //   this.sendTradeDecision(tradeInstance);
  // }
  //
  @Command()
  @KeyBinding({ description: 'Open Inventory', defaultMapper: 'keyboard', key: 'i' })
  public inventory() {
    Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:client-inventory-request`, undefined, '');
  }
  //
  // private sendTradeDecision(tradeInstance: TradeInstance & { result: 'accept' | 'reject' | 'block' }): void {
  //   this.cachedTradeInstances = [
  //     ...this.cachedTradeInstances.filter((_tradeInstance) => _tradeInstance.tradeId !== tradeInstance.tradeId),
  //   ];
  //
  //   if (this.cachedTimeouts.has(tradeInstance.tradeId)) {
  //     clearTimeout(this.cachedTimeouts.get(tradeInstance.tradeId));
  //     this.cachedTimeouts.delete(tradeInstance.tradeId);
  //   }
  //
  //   Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:client-responded-to-trade`, tradeInstance);
  // }
  //
  // private async draw(x, y, z, ped) {
  //   let [visible, x1, y1] = Cfx.Client.GetScreenCoordFromWorldCoord(x, y, z);
  //
  //   if (visible) {
  //     if (!Cfx.Client.HasStreamedTextureDictLoaded('inventorysprites')) {
  //       Cfx.Client.RequestStreamedTextureDict('inventorysprites', true);
  //
  //       while (!Cfx.Client.HasStreamedTextureDictLoaded('inventorysprites')) {
  //         await Delay(100);
  //       }
  //     } else {
  //       const cursorPosition: number[] = Cfx.Client.GetNuiCursorPosition();
  //       const realScreenPosition: number[] = this.getRealScreenCoordsFromOffsets(x1, y1);
  //
  //       if (
  //         Math.abs(cursorPosition[0] - realScreenPosition[0]) < 36 &&
  //         Math.abs(cursorPosition[1] - realScreenPosition[1]) < 36
  //       ) {
  //         // prettier-ignore
  //         Cfx.Client.DrawSprite('inventorysprites', 'inventory-give-selected', x1, y1, 0.08, 0.14, 0, 255, 255, 255, 255);
  //
  //         if (!this.selectedPeds.includes(ped)) {
  //           this.selectedPeds.push(ped);
  //         }
  //       } else {
  //         Cfx.Client.DrawSprite('inventorysprites', 'inventory-give', x1, y1, 0.08, 0.14, 0, 255, 255, 255, 255);
  //       }
  //     }
  //   }
  // }
  //
  // private showClosestPedsICanOfferTo(): void {
  //   let [handle, _entity]: [number, number] = Cfx.Client.FindFirstPed(0);
  //   const [x, y, z] = Cfx.Client.GetEntityCoords(Cfx.Client.PlayerPedId(), true);
  //
  //   let found: boolean = true;
  //   while (found) {
  //     let [f, entity]: [boolean, number] = Cfx.Client.FindNextObject(handle);
  //     found = f;
  //
  //     if (entity !== Cfx.Client.GetPlayerPed(-1)) {
  //       let coords = Cfx.Client.GetEntityCoords(entity, true);
  //       if (Cfx.Client.GetDistanceBetweenCoords(x, y, z, coords[0], coords[1], coords[2], true) < 4.0) {
  //         this.draw(coords[0], coords[1], coords[2], entity);
  //       }
  //     }
  //   }
  //
  //   Cfx.Client.EndFindObject(handle);
  // }
  //
  // private getRealScreenCoordsFromOffsets(X: number, Y: number): [number, number] {
  //   const screenResolution: [number, number] = Cfx.Client.GetActiveScreenResolution();
  //   return [screenResolution[0] * X, screenResolution[1] * Y];
  // }
}
