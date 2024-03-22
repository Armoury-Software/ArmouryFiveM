import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';
import { calculateDistance } from '@core/utils';

import { EXTERNAL_INVENTORY_MAPPINGS } from '@shared/external-inventory.mappings';
import { ItemConstructor } from '@shared/helpers/inventory-item.constructor';
import { Item, AdditionalInventory, ItemList } from '@shared/item-list.model';
import { ITEM_MAPPINGS } from '@shared/item-mappings';
import { OPTIONS } from '@shared/options';
import { TradeInstance } from '@shared/trade.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerController {
  private playersAdjustingTradeAmountsWithPlayers: Map<number, number> =
    new Map();
  private playersTradingWithPlayers: Map<number, Map<number, TradeInstance>> =
    new Map();
  private playersBlockingTradeWithPlayers: Map<number, number> = new Map();
  private pendingItemsToBeReceivedByPlayers: Map<
    number,
    (Item & { _svAmount: number })[]
  > = new Map();

  @Export()
  public givePlayerItem(
    playerId: number,
    item: Item,
    amount: any,
    fromSourceValue?: any,
    ignoreInventoryRefresh?: boolean
  ): void {
    global.exports['authentication'].setPlayerInfo(
      playerId,
      item._piKey,
      new ItemConstructor(
        (playerInfoKey: string) =>
          global.exports['authentication'].getPlayerInfo(
            playerId,
            playerInfoKey
          ),
        item._piKey,
        undefined,
        this.translationLanguage
      ).incrementFromSource(
        fromSourceValue || undefined,
        amount,
        item.metadata?.type || item.image
      ),
      false
    );

    if (!ignoreInventoryRefresh) {
      emit(`inventory:client-inventory-request`, playerId, undefined, true);
    }
  }

  @Export()
  public consumePlayerItem(
    playerId: number,
    item: Item,
    amount: any,
    toDestinationValue?: any,
    ignoreInventoryRefresh?: boolean
  ): void {
    global.exports['authentication'].setPlayerInfo(
      playerId,
      item._piKey,
      new ItemConstructor(
        (playerInfoKey: string) =>
          global.exports['authentication'].getPlayerInfo(
            playerId,
            playerInfoKey
          ),
        item._piKey,
        undefined,
        this.translationLanguage
      ).incrementFromSource(
        toDestinationValue || undefined,
        -amount,
        item.metadata?.type || item.image
      ),
      false
    );

    if (!ignoreInventoryRefresh) {
      emit(`inventory:client-inventory-request`, playerId, undefined, true);
    }
  }

  @EventListener({ eventName: 'inventory:client-confirm-trade' })
  public onInventoryItemTradeConfirmed(
    data: {
      item: Item;
      amount: number;
    },
    _target?: number
  ): void {
    _target = _target || source;

    if (this.playersAdjustingTradeAmountsWithPlayers.has(_target)) {
      this.onClientBeginTradeWithPlayer(
        this.playersAdjustingTradeAmountsWithPlayers.get(_target),
        data.item,
        data.amount,
        _target
      );

      this.playersAdjustingTradeAmountsWithPlayers.delete(_target);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:client-request-trade`,
  })
  public onClientRequestTrade(
    otherPlayerNetworkEntityId: number,
    _item: Item
  ): void {
    const playerId: number = source;

    const existingPlayerItemAmount = (<any>(
      ITEM_MAPPINGS[_item._piKey].bruteAmount
    ))(
      _item.image,
      global.exports['authentication'].getPlayerInfo(playerId, _item._piKey),
      _item.image
    );

    if (existingPlayerItemAmount > 1) {
      this.playersAdjustingTradeAmountsWithPlayers.set(
        playerId,
        otherPlayerNetworkEntityId
      );
      this.onShouldShowTradeDialogToPlayer(playerId, {
        title: this.translate('amount_confirmation'),
        item: {
          ..._item,
          topLeft: '',
          bottomRight: '',
          value: existingPlayerItemAmount,
        },
      });
    } else if (existingPlayerItemAmount == 1) {
      if (this.playersAdjustingTradeAmountsWithPlayers.has(playerId)) {
        this.playersAdjustingTradeAmountsWithPlayers.delete(playerId);
      }

      this.onClientBeginTradeWithPlayer(
        otherPlayerNetworkEntityId,
        _item,
        playerId
      );
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:client-begin-trade-with-player`,
  })
  public onClientBeginTradeWithPlayer(
    otherPlayerNetworkEntityId: number,
    _item: Item,
    tradingAmount: number,
    _source?: number
  ): void {
    if (tradingAmount < 0) {
      console.error(
        `Rejecting trade initiated by ${GetPlayerName(
          source
        )} (#${source}) due to an invalid trading amount.`
      );
      return;
    }

    const playerId: number = _source ?? source;
    // TODO: Refresh selectedPeds in client when moving away from player, elseway the entire code breaks
    // TODO: Check if network entity/entity exists anymore. If not, halt the execution of the rest of the code.
    const playerPed: number = GetPlayerPed(playerId);
    const [playerX, playerY, playerZ] = GetEntityCoords(playerPed, true);

    const otherPlayerId: number = NetworkGetEntityOwner(
      NetworkGetEntityFromNetworkId(otherPlayerNetworkEntityId)
    );
    const otherPlayerPed: number = GetPlayerPed(otherPlayerId);
    const [otherPlayerX, otherPlayerY, otherPlayerZ] = GetEntityCoords(
      otherPlayerPed,
      true
    );

    const existingPlayerItem = global.exports['authentication'].getPlayerInfo(
      playerId,
      _item._piKey
    );
    const existingPlayerItemAmount = (<any>(
      ITEM_MAPPINGS[_item._piKey].bruteAmount
    ))(_item.image, existingPlayerItem, _item.image);

    if (
      !existingPlayerItemAmount /* TODO: Add check here for if the amount in the dialog is higher than his actual amount */
    ) {
      console.error(
        `${GetPlayerName(
          playerId
        )} (#${playerId}) tried to give ${GetPlayerName(
          otherPlayerId
        )} (#${otherPlayerId}) an item which he does not own. (${_item._piKey.substring(
          0,
          24
        )}, ${_item.image.substring(0, 24)})`
      );
      return;
    }

    let uiItem: Item | Item[] = new ItemConstructor(
      this.inventoryPIFunction(playerId),
      _item._piKey,
      undefined,
      this.translationLanguage
    ).get();

    if (Array.isArray(uiItem)) {
      uiItem = uiItem.find((__item) => __item.image === _item.image);
    }

    if (
      calculateDistance([
        playerX,
        playerY,
        playerZ,
        otherPlayerX,
        otherPlayerY,
        otherPlayerZ,
      ]) < 4.0
    ) {
      if (!this.playersTradingWithPlayers.has(playerId)) {
        this.playersTradingWithPlayers.set(playerId, new Map());
      }

      const tradeInstanceMapForPlayerId =
        this.playersTradingWithPlayers.get(playerId);

      const constructedItem = {
        ...uiItem,
        _svAmount: tradingAmount,
        bottomRight:
          existingPlayerItem instanceof Object
            ? (<any>ITEM_MAPPINGS[_item._piKey]).value([
                uiItem.image,
                tradingAmount,
              ])
            : (<any>ITEM_MAPPINGS[_item._piKey]).value(
                tradingAmount,
                tradingAmount
              ),
      };

      if (tradeInstanceMapForPlayerId.has(otherPlayerId)) {
        const otherPlayerIdTradeInstance =
          tradeInstanceMapForPlayerId.get(otherPlayerId);

        let tradeInstanceWithOtherPlayerIdAndSameItem =
          otherPlayerIdTradeInstance.items.find(
            (existingTradeItem) =>
              existingTradeItem.image === (<Item>uiItem).image
          );

        if (tradeInstanceWithOtherPlayerIdAndSameItem) {
          console.error(
            `Refusing trade between ${GetPlayerName(
              playerId
            )} (#${playerId}) and ${GetPlayerName(
              otherPlayerId
            )} (#${otherPlayerId}) because the item to be traded already existed in a trade instance between them.`
          );
          return;
        } else {
          otherPlayerIdTradeInstance.items = [
            ...otherPlayerIdTradeInstance.items,
            constructedItem,
          ];
        }

        tradeInstanceMapForPlayerId.set(
          otherPlayerId,
          otherPlayerIdTradeInstance
        );
      } else {
        tradeInstanceMapForPlayerId.set(otherPlayerId, {
          tradeId: `${playerId}_${otherPlayerId}`,
          items: [constructedItem],
          timeRemaining: OPTIONS.MAX_TRADE_TIME,
          acceptButtonText: this.translate('accept'),
          rejectButtonText: this.translate('reject'),
        });
      }

      this.playersTradingWithPlayers.set(playerId, tradeInstanceMapForPlayerId);

      global.exports['authentication'].setPlayerInfo(
        playerId,
        _item._piKey,
        new ItemConstructor(
          () =>
            global.exports['authentication'].getPlayerInfo(
              playerId,
              _item._piKey
            ),
          _item._piKey,
          undefined,
          this.translationLanguage
        ).incrementFromSource(undefined, -tradingAmount, _item.image),
        false
      );

      this.onClientRequestsToOpenInventory(playerId, undefined, true);

      TriggerClientEvent(
        `${GetCurrentResourceName()}:client-show-trade-notification`,
        otherPlayerId,
        tradeInstanceMapForPlayerId.get(otherPlayerId)
      );

      emit(
        `${GetCurrentResourceName()}:player-trade-item-given`,
        playerId,
        otherPlayerId,
        constructedItem
      );
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:client-responded-to-trade`,
  })
  public onClientRespondedToTrade(
    tradeInstance: TradeInstance & { result: 'accept' | 'reject' | 'block' }
  ): void {
    const offeredPlayerId: number = source;
    const [tradeOffererId, tradeOfferedId] = tradeInstance.tradeId
      .split('_')
      .map((key) => Number(key));

    if (tradeOfferedId !== offeredPlayerId) {
      console.error(
        `${GetPlayerName(
          offeredPlayerId
        )} (#${offeredPlayerId}) attempted to accept a trade which was not logged on the server.`
      );
      return;
    }

    if (
      !this.playersTradingWithPlayers.has(tradeOffererId) ||
      !this.playersTradingWithPlayers.get(tradeOffererId).has(offeredPlayerId)
    ) {
      console.error(
        `${GetPlayerName(
          offeredPlayerId
        )} (#${offeredPlayerId}) attempted to accept a trade which was not logged on the server.`
      );
      return;
    }

    switch (tradeInstance.result) {
      case 'accept': {
        this.pendingItemsToBeReceivedByPlayers.set(tradeOfferedId, [
          ...(this.pendingItemsToBeReceivedByPlayers.has(tradeOfferedId)
            ? this.pendingItemsToBeReceivedByPlayers.get(tradeOfferedId)
            : []),
          ...this.playersTradingWithPlayers
            .get(tradeOffererId)
            .get(tradeOfferedId).items,
        ]);

        emit(
          `${GetCurrentResourceName()}:player-accepted-trade`,
          tradeOfferedId,
          tradeOffererId
        );
        break;
      }
      case 'reject':
      case 'block': {
        if (tradeInstance.result === 'block') {
          // TODO: Here, instead of blocking directly, show a dialog for the player to confirm the block. Also specify that the block only persists until disconnect.
          this.playersBlockingTradeWithPlayers.set(
            tradeOfferedId,
            tradeOffererId
          );
        }

        tradeInstance.items.forEach((item) => {
          global.exports['authentication'].setPlayerInfo(
            tradeOffererId,
            item._piKey,
            new ItemConstructor(
              () =>
                global.exports['authentication'].getPlayerInfo(
                  tradeOffererId,
                  item._piKey
                ),
              item._piKey,
              undefined,
              this.translationLanguage
            ).incrementFromSource(undefined, item._svAmount, item.image),
            false
          );
        });

        this.onClientRequestsToOpenInventory(tradeOffererId, undefined, true);
        break;
      }
    }

    this.playersTradingWithPlayers.get(tradeOffererId).delete(tradeOfferedId);

    if (
      !Array.from(this.playersTradingWithPlayers.get(tradeOffererId).keys())
        .length
    ) {
      this.playersTradingWithPlayers.delete(tradeOffererId);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:player-accepted-trade`,
  })
  public onPlayerAcceptedTrade(
    offeredPlayerId: number,
    offererPlayerId: number
  ): void {
    const itemsToBeReceived =
      this.getPendingItemsToBeReceivedByPlayer(offeredPlayerId);

    const piKeysToConsider: string[] = ['items', 'cash'];

    itemsToBeReceived.forEach((item) => {
      if (piKeysToConsider.includes(item._piKey)) {
        global.exports['authentication'].setPlayerInfo(
          offeredPlayerId,
          item._piKey,
          new ItemConstructor(
            () =>
              global.exports['authentication'].getPlayerInfo(
                offeredPlayerId,
                item._piKey
              ),
            item._piKey,
            undefined,
            this.translationLanguage
          ).incrementFromSource(undefined, item._svAmount, item.image),
          false
        );

        this.onClientRequestsToOpenInventory(offeredPlayerId, undefined, true);
      }
    });

    this.removePendingItemToBeReceivedByPlayer(
      offeredPlayerId,
      ...piKeysToConsider
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:client-inventory-request`,
  })
  public onClientRequestsToOpenInventory(
    source: number,
    extraInventoryMapping?: string | AdditionalInventory,
    onlyIfAlreadyOpen?: boolean
  ) {
    let additionalPanel!: AdditionalInventory;

    if (source == null) {
      source = global.source;
    }

    if (extraInventoryMapping) {
      if (typeof extraInventoryMapping === 'string') {
        additionalPanel = EXTERNAL_INVENTORY_MAPPINGS(this.translationLanguage)[
          extraInventoryMapping
        ];
      } else if (typeof extraInventoryMapping === 'object') {
        additionalPanel = extraInventoryMapping;
      }
    }

    // prettier-ignore
    const items: ItemList = {
      house_keys: ItemConstructor.bundle(
        new ItemConstructor(this.inventoryPIFunction(source), 'housekeys', 'house', this.translationLanguage).get()
      ),
      business_keys: ItemConstructor.bundle(
        new ItemConstructor(this.inventoryPIFunction(source), 'businesskeys', 'business', this.translationLanguage).get()
      ),
      vehicles: ItemConstructor.bundle(
        new ItemConstructor(this.inventoryPIFunction(source), 'vehiclekeys', 'vehicle', this.translationLanguage).get()
      ),
      weapons: ItemConstructor.bundle(
        new ItemConstructor(this.inventoryPIFunction(source), 'weapons', 'weapon', this.translationLanguage).get()
      ),
      misc: ItemConstructor.bundle(
        new ItemConstructor(this.inventoryPIFunction(source), 'cash', undefined, this.translationLanguage).get(),
        new ItemConstructor(this.inventoryPIFunction(source), 'phone', undefined, this.translationLanguage).get(),
        new ItemConstructor(this.inventoryPIFunction(source), 'items', undefined, this.translationLanguage).get(),
        new ItemConstructor(this.inventoryPIFunction(source), 'clothings', undefined, this.translationLanguage).get(),
        new ItemConstructor(this.inventoryPIFunction(source), 'factionvehiclekeys', undefined, this.translationLanguage).get()
      ),
    };

    TriggerClientEvent(
      `${GetCurrentResourceName()}:force-showui`,
      source || global.source,
      {
        items,
        additionalPanel,
        onlyIfAlreadyOpen,
      }
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:show-purchase-dialog`,
  })
  public onShouldShowPurchaseDialogToPlayer(source: number, data: any) {
    TriggerClientEvent(
      `${GetCurrentResourceName()}:cshow-purchase-dialog`,
      source || global.source,
      data
    );
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:show-trade-dialog` })
  public onShouldShowTradeDialogToPlayer(source: number, data: any) {
    TriggerClientEvent(
      `${GetCurrentResourceName()}:cshow-trade-dialog`,
      source || global.source,
      data
    );
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();

    const playerId: number = source;

    if (this.playersTradingWithPlayers.has(playerId)) {
      this.playersTradingWithPlayers.get(playerId).forEach((map) => {
        map.items.forEach((item) => {
          // TODO: Here, saving cash might cause conflicts with authentication resource's savePlayerCriticalStats function. Need to verify.
          global.exports['authentication'].setPlayerInfo(
            playerId,
            item._piKey,
            new ItemConstructor(
              () =>
                global.exports['authentication'].getPlayerInfo(
                  playerId,
                  item._piKey
                ),
              item._piKey,
              undefined,
              this.translationLanguage
            ).incrementFromSource(undefined, item._svAmount, item.image),
            false
          );
        });
      });

      this.playersTradingWithPlayers.delete(playerId);
    }

    Array.from(this.playersTradingWithPlayers.keys()).forEach((_playerId) => {
      if (this.playersTradingWithPlayers.get(_playerId).has(playerId)) {
        this.playersTradingWithPlayers.get(_playerId).delete(playerId);
      }
    });

    if (this.playersAdjustingTradeAmountsWithPlayers.has(playerId)) {
      this.playersAdjustingTradeAmountsWithPlayers.delete(playerId);
    }
  }

  // TODO: Server controllers should not intercept events directly transmitted from the client.
  // TODO: Instead, in this case it should be intercepted first by inventory server.controller.ts, then an emit() should be
  // TODO: ..called after a validation.
  @EventListener({
    eventName: `${GetCurrentResourceName()}:inventory-item-clicked`,
  })
  public onPlayerInventoryItemClicked(itemClickEvent: { item: Item }): void {
    const playerId: number = source;
    if (
      this.getPlayerHasItem(
        playerId,
        itemClickEvent.item._piKey,
        itemClickEvent.item.metadata?.['type'] || itemClickEvent.item.image
      )
    ) {
      if (itemClickEvent.item._piKey === 'clothings') {
        const clothingComponents =
          global.exports['character-creation'].getPlayerClothingComponents(
            playerId
          );

        global.exports['character-creation'].updatePlayerClothingComponents(
          playerId,
          {
            ...global.exports['authentication'].getPlayerInfo(
              playerId,
              'clothings'
            )?.[
              itemClickEvent.item.metadata?.['type'] ||
                itemClickEvent.item.image
            ],
          },
          false
        );

        this.consumePlayerItem(playerId, itemClickEvent.item, 1);

        setTimeout(
          () =>
            this.givePlayerItem(
              playerId,
              <any>{
                _piKey: 'clothings',
                image: clothingComponents.components.clothingId || 'clothing',
              },
              {
                ...clothingComponents,
              }
            ),
          100
        );
      }
    }
  }

  @Export()
  public getPendingItemsToBeReceivedByPlayer(
    playerId: number
  ): (Item & { _svAmount: number })[] {
    if (this.pendingItemsToBeReceivedByPlayers.has(playerId)) {
      return this.pendingItemsToBeReceivedByPlayers.get(playerId);
    }

    return [];
  }

  @Export()
  public removePendingItemToBeReceivedByPlayer(
    playerId: number,
    ...piKeys: string[]
  ): void {
    if (this.pendingItemsToBeReceivedByPlayers.has(playerId)) {
      const updatedList = this.pendingItemsToBeReceivedByPlayers
        .get(playerId)
        .filter((item) => !piKeys.includes(item._piKey));

      if (!updatedList.length) {
        this.pendingItemsToBeReceivedByPlayers.delete(playerId);
      } else {
        this.pendingItemsToBeReceivedByPlayers.set(playerId, updatedList);
      }
    }
  }

  @Export()
  public getTradeRequestsItemsBetweenPlayers(
    offererPlayerId: number,
    offeredPlayerId: number
  ): (Item & { _svAmount: number })[] {
    if (
      this.playersTradingWithPlayers.has(offererPlayerId) &&
      this.playersTradingWithPlayers.get(offererPlayerId).has(offeredPlayerId)
    ) {
      return this.playersTradingWithPlayers
        .get(offererPlayerId)
        .get(offeredPlayerId).items;
    }
    return [];
  }

  @Export()
  public getPlayerHasItem(
    playerId: number,
    piKey: string,
    type?: string | number,
    amount?: number | string
  ): boolean {
    const _item = global.exports['authentication'].getPlayerInfo(
      playerId,
      piKey
    );

    if (typeof _item === 'object') {
      if (Array.isArray(_item)) {
        return _item.includes(type);
      } else {
        return !!_item[type] || _item.metadata?.['type'] === type;
      }
    }

    if (amount) {
      if (typeof amount === 'number') {
        return _item >= amount;
      }

      if (typeof amount === 'string') {
        return _item === amount;
      }
    }

    return false;
  }

  private inventoryPIFunction(target: number): Function {
    return ((playerInfoKey: string) =>
      global.exports['authentication'].getPlayerInfo(
        target,
        playerInfoKey
      )).bind(this);
  }
}
