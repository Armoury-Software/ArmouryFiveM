import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';
import {
  TrunkInspectionData,
  TRUNK_INSPECTION_TYPE,
} from '@shared/models/trunk-inspection-data.interface';

import { PlayerInfoType } from '../../../../authentication/src/shared/models/player-info.type';
import { ITEM_MAPPINGS } from '../../../../inventory/src/shared/item-mappings';
import { EXTERNAL_INVENTORY_MAPPINGS } from '../../../../inventory/src/shared/external-inventory.mappings';
import { ItemConstructor } from '../../../../inventory/src/shared/helpers/inventory-item.constructor';
import {
  Item,
  ExternalItem,
} from '../../../../inventory/src/shared/item-list.model';

@FiveMController()
export class Server extends ServerController {
  private playersInspectingTrunks: Map<number, TrunkInspectionData> = new Map<
    number,
    TrunkInspectionData
  >();

  @EventListener({ eventName: `${GetCurrentResourceName()}:inspect-trunk` })
  public onTrunkRequestInspect(
    playerWhoRequested: number,
    vehicleNetworkId: number
  ): void {
    // TODO: Add verification - Is this the player owner? Or was the vehicle simply unlocked?

    TriggerClientEvent(
      `${GetCurrentResourceName()}:open-trunk`,
      playerWhoRequested,
      vehicleNetworkId
    );
    emit(
      'inventory:client-inventory-request',
      playerWhoRequested,
      ItemConstructor.withCustomizations(
        {
          ...EXTERNAL_INVENTORY_MAPPINGS(this.translationLanguage).trunk,
          items: [
            ...EXTERNAL_INVENTORY_MAPPINGS(this.translationLanguage).trunk.items,
            ...ItemConstructor.bundle(
              new ItemConstructor(
                ((playerInfoKey: string) =>
                  this.getTrunkItemByKey(
                    NetworkGetEntityFromNetworkId(vehicleNetworkId),
                    playerInfoKey
                  )).bind(this),
                'cash',
                undefined,
                this.translationLanguage
              ).get()
            ),
            ...ItemConstructor.bundle(
              new ItemConstructor(
                ((playerInfoKey: string) =>
                  this.getTrunkItemByKey(
                    NetworkGetEntityFromNetworkId(vehicleNetworkId),
                    playerInfoKey
                  )).bind(this),
                'items',
                undefined,
                this.translationLanguage
              ).get()
            ),
            ...ItemConstructor.bundle(
              new ItemConstructor(
                ((playerInfoKey: string) =>
                  this.getTrunkItemByKey(
                    NetworkGetEntityFromNetworkId(vehicleNetworkId),
                    playerInfoKey
                  )).bind(this),
                'weapons',
                'weapon',
                this.translationLanguage
              ).get()
            ).map((item) => ({ ...item, width: 65 })),
          ],
        },
        {}
      )
    );

    this.playersInspectingTrunks.set(playerWhoRequested, {
      vehicleEntityId: NetworkGetEntityFromNetworkId(vehicleNetworkId),
      inspectionType: TRUNK_INSPECTION_TYPE.IDLE,
    });
  }

  @EventListener({ eventName: 'inventory:client-give-to-additional-inventory' })
  public onInventoryItemDraggedIntoAdditionalInventory(item: Item): void {
    if (
      ITEM_MAPPINGS[item._piKey]?.isTransferrable &&
      !ITEM_MAPPINGS[item._piKey]?.isTransferrable(item.image)
    ) {
      return;
    }

    if (this.playersInspectingTrunks.has(source)) {
      /*
      TODO: if (trunk has sufficient space to add an item) (should work when incrementing item)
      */
      const existingItemFromPlayerInventoryData: any = global.exports[
        'authentication'
      ].getPlayerInfo(source, item._piKey);

      let shouldSkipDialog: boolean = false;

      if (ITEM_MAPPINGS[item._piKey]?.shouldSkipAmountConfirmation) {
        shouldSkipDialog = ITEM_MAPPINGS[
          item._piKey
        ]?.shouldSkipAmountConfirmation(
          existingItemFromPlayerInventoryData,
          global.exports['vehicles']
            .getVehicleItems(
              this.playersInspectingTrunks.get(source).vehicleEntityId
            )
            ?.find((_item: ExternalItem) => _item.piKey === item._piKey)
            ?.amount,
          item.image
        );
      }

      this.playersInspectingTrunks.set(source, {
        ...this.playersInspectingTrunks.get(source),
        inspectionType: TRUNK_INSPECTION_TYPE.TRANSFER_TO_TRUNK,
      });

      if (!shouldSkipDialog) {
        emit('inventory:show-trade-dialog', source, {
          item: {
            ...item,
            value: ITEM_MAPPINGS[item._piKey]?.bruteAmount
              ? ITEM_MAPPINGS[item._piKey]?.bruteAmount(
                  item.image,
                  existingItemFromPlayerInventoryData
                )
              : item.value,
          },
        });
      } else {
        emit(
          'inventory:client-confirm-trade',
          {
            item,
            amount: ITEM_MAPPINGS[item._piKey]?.bruteAmount(
              item.image,
              existingItemFromPlayerInventoryData
            ),
          },
          source
        );
      }
    }
  }

  @EventListener({ eventName: 'inventory:client-receive-item' })
  public onInventoryItemRequestTakeFromAdditionalInventory(item: Item): void {
    if (
      ITEM_MAPPINGS[item._piKey]?.isTransferrable &&
      !ITEM_MAPPINGS[item._piKey]?.isTransferrable(item.image)
    ) {
      return;
    }

    if (this.playersInspectingTrunks.has(source)) {
      /*
      TODO: if (player has sufficient space for this)
      */
      const currentVehicleItems: ExternalItem[] = global.exports[
        'vehicles'
      ].getVehicleItems(
        this.playersInspectingTrunks.get(source).vehicleEntityId
      );

      const existingItemOfSameType: ExternalItem = currentVehicleItems.find(
        (_existingItem: ExternalItem) => _existingItem.piKey === item._piKey
      );

      let shouldSkipDialog: boolean = false;

      if (ITEM_MAPPINGS[item._piKey]?.shouldSkipAmountConfirmation) {
        shouldSkipDialog = ITEM_MAPPINGS[
          item._piKey
        ]?.shouldSkipAmountConfirmation(
          global.exports['vehicles']
            .getVehicleItems(
              this.playersInspectingTrunks.get(source).vehicleEntityId
            )
            ?.find((_item: ExternalItem) => _item.piKey === item._piKey)
            ?.amount,
          global.exports['authentication'].getPlayerInfo(source, item._piKey),
          item.image
        );
      }

      if (existingItemOfSameType) {
        this.playersInspectingTrunks.set(source, {
          ...this.playersInspectingTrunks.get(source),
          inspectionType: TRUNK_INSPECTION_TYPE.TRANSFER_FROM_TRUNK_TO_ME,
        });

        if (!shouldSkipDialog) {
          emit('inventory:show-trade-dialog', source, {
            item: {
              ...item,
              value: ITEM_MAPPINGS[item._piKey]?.bruteAmount
                ? ITEM_MAPPINGS[item._piKey]?.bruteAmount(
                    item.image,
                    existingItemOfSameType.amount
                  )
                : item.value,
            },
          });
        } else {
          emit(
            'inventory:client-confirm-trade',
            {
              item,
              amount: ITEM_MAPPINGS[item._piKey]?.bruteAmount(
                item.image,
                existingItemOfSameType.amount
              ),
            },
            source
          );
        }
      }
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

    if (this.playersInspectingTrunks.has(_target)) {
      if (
        this.playersInspectingTrunks.get(_target).inspectionType ===
        TRUNK_INSPECTION_TYPE.TRANSFER_TO_TRUNK
      ) {
        /*
        if (player does not have that amount in the inventory) {
          return;
        } 
        */
        let currentVehicleItems: ExternalItem[] = global.exports[
          'vehicles'
        ].getVehicleItems(
          this.playersInspectingTrunks.get(_target).vehicleEntityId
        );
        const existingItemOfSameType: ExternalItem = currentVehicleItems.find(
          (_existingItem: ExternalItem) =>
            _existingItem.piKey === data.item._piKey
        );

        currentVehicleItems = currentVehicleItems.filter(
          (item: ExternalItem) => item.piKey !== data.item._piKey
        );

        if (existingItemOfSameType) {
          global.exports['vehicles'].updateVehicleItems(
            this.playersInspectingTrunks.get(_target).vehicleEntityId,
            [
              ...currentVehicleItems,
              {
                piKey: data.item._piKey,
                amount: new ItemConstructor(
                  () => existingItemOfSameType.amount,
                  data.item._piKey,
                  undefined,
                  this.translationLanguage
                ).incrementFromSource(
                  global.exports['authentication'].getPlayerInfo(
                    _target,
                    data.item._piKey
                  ),
                  data.amount,
                  data.item.image
                ),
              },
            ]
          );
        } else {
          global.exports['vehicles'].updateVehicleItems(
            this.playersInspectingTrunks.get(_target).vehicleEntityId,
            [
              ...currentVehicleItems,
              {
                piKey: data.item._piKey,
                amount: new ItemConstructor(() => {
                  const currentPlayerItemValue: PlayerInfoType = global.exports[
                    'authentication'
                  ].getPlayerInfo(_target, data.item._piKey);

                  if (typeof currentPlayerItemValue === 'number') {
                    return 0;
                  } else if (typeof currentPlayerItemValue === 'string') {
                    return '';
                  } else if (Array.isArray(currentPlayerItemValue)) {
                    return [];
                  } else {
                    return {};
                  }
                }, data.item._piKey, undefined, this.translationLanguage).incrementFromSource(
                  global.exports['authentication'].getPlayerInfo(
                    _target,
                    data.item._piKey
                  ),
                  data.amount,
                  data.item.image
                ),
              },
            ]
          );
        }

        // It is IMPORTANT for this to be executed AFTER the trunk incremention/decremention above
        global.exports['inventory'].consumePlayerItem(
          _target,
          data.item,
          data.amount,
          // TODO: Here it should return the actual result for each type (object: {}, array: [] etc)
          existingItemOfSameType ? existingItemOfSameType.amount : undefined
        );
      } else if (
        this.playersInspectingTrunks.get(_target).inspectionType ===
        TRUNK_INSPECTION_TYPE.TRANSFER_FROM_TRUNK_TO_ME
      ) {
        let currentVehicleItems: ExternalItem[] = global.exports[
          'vehicles'
        ].getVehicleItems(
          this.playersInspectingTrunks.get(_target).vehicleEntityId
        );
        const existingItemOfSameType: ExternalItem = currentVehicleItems.find(
          (_existingItem: ExternalItem) =>
            _existingItem.piKey === data.item._piKey
        );

        if (existingItemOfSameType) {
          currentVehicleItems = currentVehicleItems.filter(
            (item: ExternalItem) => item.piKey !== data.item._piKey
          );

          global.exports['vehicles'].updateVehicleItems(
            this.playersInspectingTrunks.get(_target).vehicleEntityId,
            [
              ...currentVehicleItems,
              {
                piKey: data.item._piKey,
                amount: new ItemConstructor(
                  () => existingItemOfSameType.amount,
                  data.item._piKey,
                  undefined,
                  this.translationLanguage
                ).incrementFromSource(
                  global.exports['authentication'].getPlayerInfo(
                    _target,
                    data.item._piKey
                  ),
                  -Math.abs(data.amount),
                  data.item.image
                ),
              },
            ]
          );

          // It is IMPORTANT for this to be executed AFTER the trunk incremention/decremention above
          global.exports['inventory'].givePlayerItem(
            _target,
            data.item,
            data.amount,
            // TODO: Here it should return the actual result for each type (object: {}, array: [] etc)
            existingItemOfSameType ? existingItemOfSameType.amount : undefined
          );
        }
      }

      this.playersInspectingTrunks.set(_target, {
        ...this.playersInspectingTrunks.get(_target),
        inspectionType: TRUNK_INSPECTION_TYPE.IDLE,
      });

      emit(
        `${GetCurrentResourceName()}:inspect-trunk`,
        _target,
        NetworkGetNetworkIdFromEntity(
          this.playersInspectingTrunks.get(_target).vehicleEntityId
        )
      );
    }
  }

  private getTrunkItemByKey(
    vehicle: number,
    playerInfoKey: string
  ): PlayerInfoType {
    const currentVehicleItems: ExternalItem[] =
      global.exports['vehicles'].getVehicleItems(vehicle);

    const existingItemOfSameType: ExternalItem = currentVehicleItems.find(
      (_existingItem: ExternalItem) => _existingItem.piKey === playerInfoKey
    );

    if (existingItemOfSameType) {
      return existingItemOfSameType.amount;
    }

    return -1;
  }

  @EventListener({ eventName: 'inventory:on-force-hidden' })
  public onInventoryHidden(): void {
    if (this.playersInspectingTrunks.has(source)) {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:close-trunk`,
        source,
        NetworkGetNetworkIdFromEntity(
          this.playersInspectingTrunks.get(source).vehicleEntityId
        )
      );
      this.playersInspectingTrunks.delete(source);
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    if (this.playersInspectingTrunks.has(source)) {
      this.playersInspectingTrunks.delete(source);
    }
  }
}
