import { Controller, ServerTranslateService, Export, EventListener } from '@armoury/fivem-framework';
import {
  ServerItemsService,
  Item,
  ItemStash,
  InfiniteStash,
  NumberItem,
  type IItemBase,
  GenericStash,
} from '@armoury/fivem-roleplay-gamemode';
import { Inject } from 'injection-js';

@Controller()
export class Server {
  // private playersAdjustingTradeAmountsWithPlayers: Map<number, number> = new Map();
  // private playersTradingWithPlayers: Map<number, Map<number, TradeInstance>> = new Map();
  // private playersBlockingTradeWithPlayers: Map<number, number> = new Map();
  // private pendingItemsToBeReceivedByPlayers: Map<number, (Item & { _svAmount: number })[]> = new Map();

  public constructor(
    @Inject(ServerTranslateService) private readonly _translate: ServerTranslateService,
    @Inject(ServerItemsService) private readonly _items: ServerItemsService
  ) {
    // const stashOne = new InfiniteStash('infinite-stash', 20, 60);
    // const stashTwo = new ItemStash('StashTwo', 20, 60);
    // const itemOne = new NumberItem('TestItemOne', 1, false, 3);
    // console.log('(before:) stashOne is', stashOne._items, ', stashTwo is', stashTwo._items, ', item is', itemOne);
    // _items.transfer(stashOne, stashTwo, itemOne);
    // console.log('(after:) stashOne is', stashOne._items, ', stashTwo is', stashTwo._items, ', item is', itemOne);
    // --------
    // const stashOne = new ItemStash('StashOne', 20, 60);
    // const stashTwo = new ItemStash('StashTwo', 20, 60);
    // const itemOne = new NumberItem('TestItemOne', 1, false, 3);
    // const itemTwo = new NumberItem('TestItemTwo', 1, false, 2);
    // console.log('item is', itemOne);
    // stashOne.add(itemOne);
    // stashTwo.add(itemTwo);
    // console.log('stashOne after add:', stashOne.items);
    // // stashOne.consume(itemOne, 1);
    // // console.log('stashOne after consume:', stashOne.items);
    //
    // console.log('stashTwo before transfer:', stashTwo.items);
    // this._items.transfer(stashOne, stashTwo, itemOne, 4);
    // console.log('stashOne after transfer:', stashOne.items);
    // console.log('stashTwo after transfer:', stashTwo.items);
    //
    // console.log('stashTwo serialized:', JSON.stringify(stashTwo.serialize()));
  }

  // @Export()
  // public givePlayerItem<T>(
  //     playerId: number,
  //     item: Item<T>,
  //     amount: any,
  //     fromSourceValue?: any,
  //     ignoreInventoryRefresh?: boolean
  // ): void {
  //     Cfx.exports['authentication'].setPlayerInfo(
  //         playerId,
  //         item._piKey,
  //         new ItemConstructor(
  //             (playerInfoKey: string) => Cfx.exports['authentication'].getPlayerInfo(playerId, playerInfoKey),
  //             item._piKey,
  //             undefined,
  //             this._translate.getLanguage(playerId)
  //         ).incrementFromSource(fromSourceValue || undefined, amount, item.metadata?.type || item.image),
  //         false
  //     );
  //
  //     if (!ignoreInventoryRefresh) {
  //         Cfx.emit(`inventory:client-inventory-request`, playerId, undefined, true);
  //     }
  // }
  //
  // @Export()
  // public consumePlayerItem(
  //   playerId: number,
  //   item: Item,
  //   amount: any,
  //   toDestinationValue?: any,
  //   ignoreInventoryRefresh?: boolean
  // ): void {
  //   Cfx.exports['authentication'].setPlayerInfo(
  //     playerId,
  //     item._piKey,
  //     new ItemConstructor(
  //       (playerInfoKey: string) => Cfx.exports['authentication'].getPlayerInfo(playerId, playerInfoKey),
  //       item._piKey,
  //       undefined,
  //       this._translate.getLanguage(playerId)
  //     ).incrementFromSource(toDestinationValue || undefined, -amount, item.metadata?.type || item.image),
  //     false
  //   );
  //
  //   if (!ignoreInventoryRefresh) {
  //     Cfx.emit(`inventory:client-inventory-request`, playerId, undefined, true);
  //   }
  // }
  //
  // @EventListener({ eventName: 'inventory:client-confirm-trade' })
  // public onInventoryItemTradeConfirmed(
  //   data: {
  //     item: Item;
  //     amount: number;
  //   },
  //   _target?: number
  // ): void {
  //   _target = _target || Cfx.source;
  //
  //   if (this.playersAdjustingTradeAmountsWithPlayers.has(_target)) {
  //     this.onClientBeginTradeWithPlayer(
  //       this.playersAdjustingTradeAmountsWithPlayers.get(_target),
  //       data.item,
  //       data.amount,
  //       _target
  //     );
  //
  //     this.playersAdjustingTradeAmountsWithPlayers.delete(_target);
  //   }
  // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:client-request-trade`,
  // })
  // public onClientRequestTrade(otherPlayerNetworkEntityId: number, _item: Item): void {
  //   const playerId: number = Cfx.source;
  //
  //   const existingPlayerItemAmount = (<any>ITEM_MAPPINGS[_item._piKey].bruteAmount)(
  //     _item.image,
  //     Cfx.exports['authentication'].getPlayerInfo(playerId, _item._piKey),
  //     _item.image
  //   );
  //
  //   if (existingPlayerItemAmount > 1) {
  //     this.playersAdjustingTradeAmountsWithPlayers.set(playerId, otherPlayerNetworkEntityId);
  //     this.onShouldShowTradeDialogToPlayer(playerId, {
  //       title: this._translate.instant(playerId, 'amount_confirmation'),
  //       item: {
  //         ..._item,
  //         topLeft: '',
  //         bottomRight: '',
  //         value: existingPlayerItemAmount,
  //       },
  //     });
  //   } else if (existingPlayerItemAmount == 1) {
  //     if (this.playersAdjustingTradeAmountsWithPlayers.has(playerId)) {
  //       this.playersAdjustingTradeAmountsWithPlayers.delete(playerId);
  //     }
  //
  //     this.onClientBeginTradeWithPlayer(otherPlayerNetworkEntityId, _item, playerId);
  //   }
  // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:client-begin-trade-with-player`,
  // })
  // public onClientBeginTradeWithPlayer(
  //   otherPlayerNetworkEntityId: number,
  //   _item: Item,
  //   tradingAmount: number,
  //   _source?: number
  // ): void {
  //   const playerId: number = _source ?? Cfx.source;
  //
  //   if (tradingAmount < 0) {
  //     console.error(
  //       `Rejecting trade initiated by ${Cfx.Server.GetPlayerName(
  //         playerId.toString()
  //       )} (#${playerId}) due to an invalid trading amount.`
  //     );
  //     return;
  //   }
  //
  //   // TODO: Refresh selectedPeds in client when moving away from player, elseway the entire code breaks
  //   // TODO: Check if network entity/entity exists anymore. If not, halt the execution of the rest of the code.
  //   const playerPed: number = Cfx.Server.GetPlayerPed(playerId.toString());
  //   const [playerX, playerY, playerZ] = Cfx.Server.GetEntityCoords(playerPed);
  //
  //   const otherPlayerId: number = Cfx.Server.NetworkGetEntityOwner(
  //     Cfx.Server.NetworkGetEntityFromNetworkId(otherPlayerNetworkEntityId)
  //   );
  //   const otherPlayerPed: number = Cfx.Server.GetPlayerPed(otherPlayerId.toString());
  //   const [otherPlayerX, otherPlayerY, otherPlayerZ] = Cfx.Server.GetEntityCoords(otherPlayerPed);
  //
  //   const existingPlayerItem = Cfx.exports['authentication'].getPlayerInfo(playerId, _item._piKey);
  //   const existingPlayerItemAmount = (<any>ITEM_MAPPINGS[_item._piKey].bruteAmount)(
  //     _item.image,
  //     existingPlayerItem,
  //     _item.image
  //   );
  //
  //   if (
  //     !existingPlayerItemAmount /* TODO: Add check here for if the amount in the dialog is higher than his actual amount */
  //   ) {
  //     console.error(
  //       `${Cfx.Server.GetPlayerName(playerId.toString())} (#${playerId}) tried to give ${Cfx.Server.GetPlayerName(
  //         otherPlayerId.toString()
  //       )} (#${otherPlayerId}) an item which he does not own. (${_item._piKey.substring(
  //         0,
  //         24
  //       )}, ${_item.image.substring(0, 24)})`
  //     );
  //     return;
  //   }
  //
  //   let uiItem: Item | Item[] = new ItemConstructor(
  //     this.inventoryPIFunction(playerId),
  //     _item._piKey,
  //     undefined,
  //     this._translate.getLanguage(playerId)
  //   ).get();
  //
  //   if (Array.isArray(uiItem)) {
  //     uiItem = uiItem.find((__item) => __item.image === _item.image);
  //   }
  //
  //   if (LocationUtils.distance(playerX, playerY, playerZ, otherPlayerX, otherPlayerY, otherPlayerZ) < 4.0) {
  //     if (!this.playersTradingWithPlayers.has(playerId)) {
  //       this.playersTradingWithPlayers.set(playerId, new Map());
  //     }
  //
  //     const tradeInstanceMapForPlayerId = this.playersTradingWithPlayers.get(playerId);
  //
  //     const constructedItem = {
  //       ...uiItem,
  //       _svAmount: tradingAmount,
  //       bottomRight:
  //         existingPlayerItem instanceof Object
  //           ? (<any>ITEM_MAPPINGS[_item._piKey]).value([uiItem.image, tradingAmount])
  //           : (<any>ITEM_MAPPINGS[_item._piKey]).value(tradingAmount, tradingAmount),
  //     };
  //
  //     if (tradeInstanceMapForPlayerId.has(otherPlayerId)) {
  //       const otherPlayerIdTradeInstance = tradeInstanceMapForPlayerId.get(otherPlayerId);
  //
  //       let tradeInstanceWithOtherPlayerIdAndSameItem = otherPlayerIdTradeInstance.items.find(
  //         (existingTradeItem) => existingTradeItem.image === (<Item>uiItem).image
  //       );
  //
  //       if (tradeInstanceWithOtherPlayerIdAndSameItem) {
  //         console.error(
  //           `Refusing trade between ${Cfx.Server.GetPlayerName(
  //             playerId.toString()
  //           )} (#${playerId}) and ${Cfx.Server.GetPlayerName(
  //             otherPlayerId.toString()
  //           )} (#${otherPlayerId}) because the item to be traded already existed in a trade instance between them.`
  //         );
  //         return;
  //       } else {
  //         otherPlayerIdTradeInstance.items = [...otherPlayerIdTradeInstance.items, constructedItem];
  //       }
  //
  //       tradeInstanceMapForPlayerId.set(otherPlayerId, otherPlayerIdTradeInstance);
  //     } else {
  //       tradeInstanceMapForPlayerId.set(otherPlayerId, {
  //         tradeId: `${playerId}_${otherPlayerId}`,
  //         items: [constructedItem],
  //         timeRemaining: OPTIONS.MAX_TRADE_TIME,
  //         acceptButtonText: this._translate.instant(playerId, 'accept'),
  //         rejectButtonText: this._translate.instant(playerId, 'reject'),
  //       });
  //     }
  //
  //     this.playersTradingWithPlayers.set(playerId, tradeInstanceMapForPlayerId);
  //
  //     Cfx.exports['authentication'].setPlayerInfo(
  //       playerId,
  //       _item._piKey,
  //       new ItemConstructor(
  //         () => Cfx.exports['authentication'].getPlayerInfo(playerId, _item._piKey),
  //         _item._piKey,
  //         undefined,
  //         this._translate.getLanguage(playerId)
  //       ).incrementFromSource(undefined, -tradingAmount, _item.image),
  //       false
  //     );
  //
  //     this.onClientRequestsToOpenInventory(playerId, undefined, true);
  //
  //     Cfx.TriggerClientEvent(
  //       `${Cfx.Server.GetCurrentResourceName()}:client-show-trade-notification`,
  //       otherPlayerId,
  //       tradeInstanceMapForPlayerId.get(otherPlayerId)
  //     );
  //
  //     Cfx.emit(
  //       `${Cfx.Server.GetCurrentResourceName()}:player-trade-item-given`,
  //       playerId,
  //       otherPlayerId,
  //       constructedItem
  //     );
  //   }
  // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:client-responded-to-trade`,
  // })
  // public onClientRespondedToTrade(tradeInstance: TradeInstance & { result: 'accept' | 'reject' | 'block' }): void {
  //   const offeredPlayerId: number = Cfx.source;
  //   const [tradeOffererId, tradeOfferedId] = tradeInstance.tradeId.split('_').map((key) => Number(key));
  //
  //   if (tradeOfferedId !== offeredPlayerId) {
  //     console.error(
  //       `${Cfx.Server.GetPlayerName(
  //         offeredPlayerId.toString()
  //       )} (#${offeredPlayerId}) attempted to accept a trade which was not logged on the server.`
  //     );
  //     return;
  //   }
  //
  //   if (
  //     !this.playersTradingWithPlayers.has(tradeOffererId) ||
  //     !this.playersTradingWithPlayers.get(tradeOffererId).has(offeredPlayerId)
  //   ) {
  //     console.error(
  //       `${Cfx.Server.GetPlayerName(
  //         offeredPlayerId.toString()
  //       )} (#${offeredPlayerId}) attempted to accept a trade which was not logged on the server.`
  //     );
  //     return;
  //   }
  //
  //   switch (tradeInstance.result) {
  //     case 'accept': {
  //       this.pendingItemsToBeReceivedByPlayers.set(tradeOfferedId, [
  //         ...(this.pendingItemsToBeReceivedByPlayers.has(tradeOfferedId)
  //           ? this.pendingItemsToBeReceivedByPlayers.get(tradeOfferedId)
  //           : []),
  //         ...this.playersTradingWithPlayers.get(tradeOffererId).get(tradeOfferedId).items,
  //       ]);
  //
  //       Cfx.emit(`${Cfx.Server.GetCurrentResourceName()}:player-accepted-trade`, tradeOfferedId, tradeOffererId);
  //       break;
  //     }
  //     case 'reject':
  //     case 'block': {
  //       if (tradeInstance.result === 'block') {
  //         // TODO: Here, instead of blocking directly, show a dialog for the player to confirm the block. Also specify that the block only persists until disconnect.
  //         this.playersBlockingTradeWithPlayers.set(tradeOfferedId, tradeOffererId);
  //       }
  //
  //       tradeInstance.items.forEach((item) => {
  //         Cfx.exports['authentication'].setPlayerInfo(
  //           tradeOffererId,
  //           item._piKey,
  //           new ItemConstructor(
  //             () => Cfx.exports['authentication'].getPlayerInfo(tradeOffererId, item._piKey),
  //             item._piKey,
  //             undefined,
  //             this._translate.getLanguage(tradeOffererId)
  //           ).incrementFromSource(undefined, item._svAmount, item.image),
  //           false
  //         );
  //       });
  //
  //       this.onClientRequestsToOpenInventory(tradeOffererId, undefined, true);
  //       break;
  //     }
  //   }
  //
  //   this.playersTradingWithPlayers.get(tradeOffererId).delete(tradeOfferedId);
  //
  //   if (!Array.from(this.playersTradingWithPlayers.get(tradeOffererId).keys()).length) {
  //     this.playersTradingWithPlayers.delete(tradeOffererId);
  //   }
  // }
  //
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:player-accepted-trade`,
  // })
  // public onPlayerAcceptedTrade(offeredPlayerId: number, offererPlayerId: number): void {
  //   const itemsToBeReceived = this.getPendingItemsToBeReceivedByPlayer(offeredPlayerId);
  //
  //   const piKeysToConsider: string[] = ['items', 'cash'];
  //
  //   itemsToBeReceived.forEach((item) => {
  //     if (piKeysToConsider.includes(item._piKey)) {
  //       Cfx.exports['authentication'].setPlayerInfo(
  //         offeredPlayerId,
  //         item._piKey,
  //         new ItemConstructor(
  //           () => Cfx.exports['authentication'].getPlayerInfo(offeredPlayerId, item._piKey),
  //           item._piKey,
  //           undefined,
  //           this._translate.getLanguage(offeredPlayerId)
  //         ).incrementFromSource(undefined, item._svAmount, item.image),
  //         false
  //       );
  //
  //       this.onClientRequestsToOpenInventory(offeredPlayerId, undefined, true);
  //     }
  //   });
  //
  //   this.removePendingItemToBeReceivedByPlayer(offeredPlayerId, ...piKeysToConsider);
  // }
  //
  @EventListener({
    eventName: `${Cfx.Server.GetCurrentResourceName()}:client-inventory-request`,
  })
  public onClientRequestsToOpenInventory(
    _source: number,
    extraStash?: ItemStash<IItemBase>,
    onlyIfAlreadyOpen?: boolean
  ) {
    _source = _source ?? Cfx.source;

    const tempStashRemoveMe = new GenericStash('genericStash', 32, 60);
    const itemOne = new tempRemoveMe('sandwich', 1, false, 1);
    const itemTwo = new tempRemoveMe('water', 1, false, 2);
    tempStashRemoveMe.add(itemOne);
    tempStashRemoveMe.add(itemTwo);

    const additionalPanel = extraStash?.toUI?.() ?? null;
    const items = {
      house_keys: [],
      business_keys: [],
      vehicles: [],
      weapons: [],
      misc: tempStashRemoveMe.toUI()?.items || [],
    };
    // // prettier-ignore
    // const items: ItemList = {
    //         house_keys: ItemConstructor.bundle(
    //             new ItemConstructor(this.inventoryPIFunction(source), 'housekeys', 'house', this._translate.getLanguage(source)).get()
    //         ),
    //         business_keys: ItemConstructor.bundle(
    //             new ItemConstructor(this.inventoryPIFunction(source), 'businesskeys', 'business', this._translate.getLanguage(source)).get()
    //         ),
    //         vehicles: ItemConstructor.bundle(
    //             new ItemConstructor(this.inventoryPIFunction(source), 'vehiclekeys', 'vehicle', this._translate.getLanguage(source)).get()
    //         ),
    //         weapons: ItemConstructor.bundle(
    //             new ItemConstructor(this.inventoryPIFunction(source), 'weapons', 'weapon', this._translate.getLanguage(source)).get()
    //         ),
    //         misc: ItemConstructor.bundle(
    //             new ItemConstructor(this.inventoryPIFunction(source), 'cash', undefined, this._translate.getLanguage(source)).get(),
    //             new ItemConstructor(this.inventoryPIFunction(source), 'phone', undefined, this._translate.getLanguage(source)).get(),
    //             new ItemConstructor(this.inventoryPIFunction(source), 'items', undefined, this._translate.getLanguage(source)).get(),
    //             new ItemConstructor(this.inventoryPIFunction(source), 'clothings', undefined, this._translate.getLanguage(source)).get(),
    //             new ItemConstructor(this.inventoryPIFunction(source), 'factionvehiclekeys', undefined, this._translate.getLanguage(source)).get()
    //         ),
    //     };
    //

    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:force-showui`, _source, {
      items,
      additionalPanel,
      onlyIfAlreadyOpen,
    });
  }
  //
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:show-purchase-dialog`,
  // })
  // public onShouldShowPurchaseDialogToPlayer(source: number, data: any) {
  //   Cfx.TriggerClientEvent(
  //     `${Cfx.Server.GetCurrentResourceName()}:cshow-purchase-dialog`,
  //     source || global.source,
  //     data
  //   );
  // }
  //
  // @EventListener({ eventName: `${Cfx.Server.GetCurrentResourceName()}:show-trade-dialog` })
  // public onShouldShowTradeDialogToPlayer(source: number, data: any) {
  //   Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:cshow-trade-dialog`, source || global.source, data);
  // }
  //
  // @EventListener()
  // public onPlayerDisconnect(): void {
  //   const playerId: number = Cfx.source;
  //
  //   if (this.playersTradingWithPlayers.has(playerId)) {
  //     this.playersTradingWithPlayers.get(playerId).forEach((map) => {
  //       map.items.forEach((item) => {
  //         // TODO: Here, saving cash might cause conflicts with authentication resource's savePlayerCriticalStats function. Need to verify.
  //         Cfx.exports['authentication'].setPlayerInfo(
  //           playerId,
  //           item._piKey,
  //           new ItemConstructor(
  //             () => Cfx.exports['authentication'].getPlayerInfo(playerId, item._piKey),
  //             item._piKey,
  //             undefined,
  //             this._translate.getLanguage(playerId)
  //           ).incrementFromSource(undefined, item._svAmount, item.image),
  //           false
  //         );
  //       });
  //     });
  //
  //     this.playersTradingWithPlayers.delete(playerId);
  //   }
  //
  //   Array.from(this.playersTradingWithPlayers.keys()).forEach((_playerId) => {
  //     if (this.playersTradingWithPlayers.get(_playerId).has(playerId)) {
  //       this.playersTradingWithPlayers.get(_playerId).delete(playerId);
  //     }
  //   });
  //
  //   if (this.playersAdjustingTradeAmountsWithPlayers.has(playerId)) {
  //     this.playersAdjustingTradeAmountsWithPlayers.delete(playerId);
  //   }
  // }
  //
  // // TODO: Server controllers should not intercept events directly transmitted from the client.
  // // TODO: Instead, in this case it should be intercepted first by inventory server.controller.ts, then an emit() should be
  // // TODO: ..called after a validation.
  // @EventListener({
  //   eventName: `${Cfx.Server.GetCurrentResourceName()}:inventory-item-clicked`,
  // })
  // public onPlayerInventoryItemClicked(itemClickEvent: { item: Item }): void {
  //   const playerId: number = Cfx.source;
  //   if (
  //     this.getPlayerHasItem(
  //       playerId,
  //       itemClickEvent.item._piKey,
  //       itemClickEvent.item.metadata?.['type'] || itemClickEvent.item.image
  //     )
  //   ) {
  //     if (itemClickEvent.item._piKey === 'clothings') {
  //       const clothingComponents = Cfx.exports['character-creation'].getPlayerClothingComponents(playerId);
  //
  //       Cfx.exports['character-creation'].updatePlayerClothingComponents(
  //         playerId,
  //         {
  //           ...Cfx.exports['authentication'].getPlayerInfo(playerId, 'clothings')?.[
  //             itemClickEvent.item.metadata?.['type'] || itemClickEvent.item.image
  //           ],
  //         },
  //         false
  //       );
  //
  //       this.consumePlayerItem(playerId, itemClickEvent.item, 1);
  //
  //       setTimeout(
  //         () =>
  //           this.givePlayerItem(
  //             playerId,
  //             <any>{
  //               _piKey: 'clothings',
  //               image: clothingComponents.components.clothingId || 'clothing',
  //             },
  //             {
  //               ...clothingComponents,
  //             }
  //           ),
  //         100
  //       );
  //     }
  //   }
  // }
  //
  // @Export()
  // public getPendingItemsToBeReceivedByPlayer(playerId: number): (Item & { _svAmount: number })[] {
  //   if (this.pendingItemsToBeReceivedByPlayers.has(playerId)) {
  //     return this.pendingItemsToBeReceivedByPlayers.get(playerId);
  //   }
  //
  //   return [];
  // }
  //
  // @Export()
  // public removePendingItemToBeReceivedByPlayer(playerId: number, ...piKeys: string[]): void {
  //   if (this.pendingItemsToBeReceivedByPlayers.has(playerId)) {
  //     const updatedList = this.pendingItemsToBeReceivedByPlayers
  //       .get(playerId)
  //       .filter((item) => !piKeys.includes(item._piKey));
  //
  //     if (!updatedList.length) {
  //       this.pendingItemsToBeReceivedByPlayers.delete(playerId);
  //     } else {
  //       this.pendingItemsToBeReceivedByPlayers.set(playerId, updatedList);
  //     }
  //   }
  // }
  //
  // @Export()
  // public getTradeRequestsItemsBetweenPlayers(
  //   offererPlayerId: number,
  //   offeredPlayerId: number
  // ): (Item & { _svAmount: number })[] {
  //   if (
  //     this.playersTradingWithPlayers.has(offererPlayerId) &&
  //     this.playersTradingWithPlayers.get(offererPlayerId).has(offeredPlayerId)
  //   ) {
  //     return this.playersTradingWithPlayers.get(offererPlayerId).get(offeredPlayerId).items;
  //   }
  //   return [];
  // }
  //
  // @Export()
  // public getPlayerHasItem(playerId: number, piKey: string, type?: string | number, amount?: number | string): boolean {
  //   const _item = Cfx.exports['authentication'].getPlayerInfo(playerId, piKey);
  //
  //   if (typeof _item === 'object') {
  //     if (Array.isArray(_item)) {
  //       return _item.includes(type);
  //     } else {
  //       return !!_item[type] || _item.metadata?.['type'] === type;
  //     }
  //   }
  //
  //   if (amount) {
  //     if (typeof amount === 'number') {
  //       return _item >= amount;
  //     }
  //
  //     if (typeof amount === 'string') {
  //       return _item === amount;
  //     }
  //   }
  //
  //   return false;
  // }
  //
  // private inventoryPIFunction(target: number): Function {
  //   return ((playerInfoKey: string) => Cfx.exports['authentication'].getPlayerInfo(target, playerInfoKey)).bind(this);
  // }
}

class tempRemoveMe extends NumberItem {}
