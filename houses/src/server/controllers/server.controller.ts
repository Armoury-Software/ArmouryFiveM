import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerEntityWithEntranceController } from '@core/server/entity-controllers/server-entity-entrance.controller';
import { UIDialog } from '@core/models/ui-dialog.model';
import {
  isPlayerInRangeOfPoint,
  numberWithCommas,
  toTitleCase,
} from '@core/utils';

import { House, HouseExtended } from '@shared/models/house.interface';
import { addTenants, getTenants } from '@shared/house.functions';
import { HOUSE_INTERIORS } from '@shared/house-interiors';
import { HOUSE_PETS_DEFAULTS } from '@shared/house-pets.default';

import { ItemConstructor } from '../../../../inventory/src/shared/helpers/inventory-item.constructor';
import {
  FridgeInspectionData,
  FRIDGE_INSPECTION_TYPE,
} from '@shared/models/fridge-inspection-data.interface';
import { Item } from '../../../../inventory/src/shared/item-list.model';
import { ITEM_MAPPINGS } from '../../../../inventory/src/shared/item-mappings';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerEntityWithEntranceController<House> {
  private playersInspectingFridges: Map<number, FridgeInspectionData> = new Map<
    number,
    FridgeInspectionData
  >();
  private playersBuyingPets: Map<number, any> = new Map();

  public constructor(dbTableName: string) {
    super(dbTableName, true);

    setTimeout(() => {
      const authenticatedPlayers =
        global.exports['authentication'].getAuthenticatedPlayers(true);

      if (authenticatedPlayers) {
        Object.keys(authenticatedPlayers).forEach((_authenticatedPlayer) => {
          const playerId: number = Number(_authenticatedPlayer);
          const playerData = authenticatedPlayers[_authenticatedPlayer];

          this.onPlayerAuthenticate(playerId, playerData);
        });
      }
    }, 1000);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-set-for-sale`,
  })
  public onPlayerRequestSetHouseForSale() {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      if (!!house.sellingPrice) {
        house.sellingPrice = 0;
        this.saveDBEntityAsync(house.id);
        this.showHouseMenu(source);
        return;
      }

      // TODO: minValue and maxValue should be validated on the server in confirm-set-for-sale as well
      const minValue: number = 1000;
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('house_set_for_sale'),
        content: this.translate('house_set_for_sale_description'),
        dialogId: 'set-house-for-sale',
        dialogComponents: [
          {
            formControlName: 'housesellprice',
            type: 'slider',
            defaultValue: minValue,
            heading: this.translate('house_selling_price'),
            metadata: {
              min: minValue,
              max: house.firstPurchasePrice * 10,
              prefix: '$',
              step: 1000,
            },
          },
        ],
        buttons: [
          {
            title: this.translate('confirm'),
          },
        ],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-set-for-sale`,
  })
  public onPlayerConfirmHouseForSale(sellPrice: number): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house) {
      house.sellingPrice = Math.floor(sellPrice);
      this.saveDBEntityAsync(house.id);
      this.showHouseMenu(source);
    }
  }

  @EventListener({ eventName: 'houses:request-sell-to-bank' })
  public onPlayerRequestSellToBank(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('house_sell_to_bank_sum', {
          price: numberWithCommas(house.firstPurchasePrice / 2),
        }),
        content: this.translate('house_sell_to_bank_confirmation'),
        dialogId: 'sell-house-to-bank',
        buttons: [
          {
            title: this.translate('confirm'),
          },
        ],
      });
    }
  }

  @EventListener({ eventName: 'houses:confirm-sell-to-bank' })
  public onPlayerConfirmSellToBank(): void {
    let house: HouseExtended =
      this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      house.owner = '';
      house.ownerId = 0;
      house.ownerInstance = null;
      house.tenantIds = [];
      house.pet = {}; // Pretty hacky
      house.sellingPrice = 0;
      this.saveDBEntityAsync(house.id);
      global.exports['authentication'].setPlayerInfo(
        source,
        'bank',
        global.exports['authentication'].getPlayerInfo(source, 'bank') +
          house.firstPurchasePrice / 2
      );
      this.teleportOutsideOfHouse(source, house);
      TriggerClientEvent('houses-menu:force-hideui', source);
    }
  }

  @EventListener({ eventName: 'houses:request-rent-options' })
  public onPlayerRequestChangeRentOptions(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      if (!!house.rentPrice) {
        house.rentPrice = 0;
        this.saveDBEntityAsync(house.id);
        this.showHouseMenu(source);
        return;
      }

      // TODO: These should be validated on the server in confirm-adjust-rent as well
      const minValue: number = 10;
      const maxValue: number = Math.max(1000, house.firstPurchasePrice / 750);

      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('house_enable_rent'),
        content: this.translate('house_enable_rent_description'),
        dialogId: 'adjust-rent-price',
        dialogComponents: [
          {
            formControlName: 'houserentprice',
            type: 'slider',
            defaultValue: minValue,
            heading: this.translate('house_rent_price_slider'),
            metadata: {
              min: minValue,
              max: maxValue,
              prefix: '$',
              step: 100,
            },
          },
        ],
        buttons: [
          {
            title: this.translate('confirm'),
          },
        ],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-adjust-rent`,
  })
  public onPlayerConfirmAdjustRent(rentPrice: number): void {
    // TODO: Do minValue and maxValue validations here! (also at house sell)
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house) {
      house.rentPrice = Math.floor(rentPrice);
      this.saveDBEntityAsync(house.id);
      this.showHouseMenu(source);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-evict-tenants`,
  })
  public onPlayerRequestEvictTenants(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('house_tenants_evict_all_sum', {
          number: (house.tenantIds?.length || 0).toString(),
        }),
        content: this.translate('house_tenants_evict_all_confirmation'),
        dialogId: 'evict-all-tenants',
        buttons: [
          {
            title: this.translate('confirm'),
          },
        ],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-evict-tenants`,
  })
  public onPlayerConfirmEvictTenants(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      house.tenantIds = [];
      // TODO: Also kick them out of the house here
      this.saveDBEntityAsync(house.id);
      this.showHouseMenu(source);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-purchase-house`,
  })
  public onPlayerRequestPurchaseHouse(): void {
    const house: HouseExtended =
      this.getClosestEntityOfSameTypeToPlayer(source);

    if (
      (house.owner && house.sellingPrice > 0) ||
      (!house.owner &&
        house.firstPurchasePrice <=
          Number(
            global.exports['authentication'].getPlayerInfo(source, 'cash')
          ))
    ) {
      const housePrice: number = !house.owner
        ? house.firstPurchasePrice
        : house.sellingPrice;

      if (house.ownerInstance) {
        global.exports['phone'].executeCall(
          source,
          global.exports['authentication'].getPlayerInfo(
            house.ownerInstance,
            'phone'
          )
        );
      } else {
        // prettier-ignore
        TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, <UIDialog>{
          title: this.translate('house_purchase_ask'),
          content: this.translate('house_purchase_ask_description', { price: numberWithCommas(housePrice) }),
          buttons: [{ title: this.translate('confirm') }],
          dialogId: 'purchase_unowned_house',
        });
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-purchase-house`,
  })
  public onPlayerConfirmPurchaseHouse(): void {
    (async (_source: number) => {
      const house: HouseExtended =
        this.getClosestEntityOfSameTypeToPlayer(_source);

      if (
        (house.owner && house.sellingPrice > 0) ||
        (!house.owner &&
          house.firstPurchasePrice <=
            Number(
              global.exports['authentication'].getPlayerInfo(_source, 'cash')
            ))
      ) {
        const housePrice: number = !house.owner
          ? house.firstPurchasePrice
          : house.sellingPrice;

        house.owner = global.exports['authentication'].getPlayerInfo(
          _source,
          'name'
        );
        house.ownerId = global.exports['authentication'].getPlayerInfo(
          _source,
          'id'
        );
        house.ownerInstance = _source;

        house.sellingPrice = 0;
        const result: boolean = await this.saveDBEntityAsync(house.id);

        if (result) {
          global.exports['authentication'].setPlayerInfo(
            _source,
            'cash',
            Number(
              global.exports['authentication'].getPlayerInfo(_source, 'cash')
            ) - housePrice,
            false
          );
          global.exports['authentication'].setPlayerInfo(_source, 'housekeys', [
            ...(<number[]>(
              global.exports['authentication'].getPlayerInfo(
                _source,
                'housekeys'
              )
            )),
            house.id,
          ]);

          this.teleportIntoHouse(_source, house);
          TriggerClientEvent(
            `${GetCurrentResourceName()}:house-purchased`,
            _source,
            house
          );
        }
      }
    })(source);
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:request-buy-alarm` })
  public onPlayerRequestBuyAlarm(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      if (house.alarm) {
        TriggerClientEvent('houses-menu:show-dialog', source, {
          title: this.translate('burglar_alarm_disable'),
          content: this.translate('burglar_alarm_disable_confirmation'),
          dialogId: 'confirm-disable-alarm',
          buttons: [
            {
              title: this.translate('confirm'),
            },
          ],
        });
        return;
      }

      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('burglar_alarm'),
        content: this.translate('burglar_alarm_description', {
          price: numberWithCommas(
            this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
          ),
          hr: this.translate('hour_shortened'),
        }),
        dialogId: 'buy-alarm',
        dialogComponents: [
          {
            formControlName: 'selectedalarm',
            type: 'stats',
            metadata: {
              items: [
                {
                  title: this.translate('burglar_alarm'),
                  image: 'burglar_alarm',
                  [this.translate('security')]: '100%',
                  [this.translate('price')]: `$${numberWithCommas(
                    this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
                  )}/${this.translate('hour_shortened')}`,
                },
              ],
            },
          },
        ],
        buttons: [
          {
            title: this.translate('confirm'),
          },
        ],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:select-alarm`,
  })
  public onPlayerSelectAlarm(eventData: any): void {
    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (
      house &&
      Number(global.exports['authentication'].getPlayerInfo(source, 'cash')) >=
        this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
    ) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('burglar_alarm'),
        content: this.translate('burglar_alarm_confirmation', {
          price: numberWithCommas(
            this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
          ),
          hr: this.translate('hour_shortened'),
        }),
        dialogId: 'confirm-buy-alarm',
        buttons: [{ title: this.translate('confirm') }],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-buy-alarm`,
  })
  public onPlayerConfirmBuyAlarm(): void {
    const playerId: number = source;
    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(playerId);
    const cash = Number(
      global.exports['authentication'].getPlayerInfo(playerId, 'cash')
    );

    if (
      house &&
      this.isHouseOwnedBy(house, playerId) &&
      cash >= this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
    ) {
      global.exports['authentication'].setPlayerInfo(
        playerId,
        'cash',
        cash - this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
      );

      house.alarm = 1;

      this.showHouseMenu(playerId);
      this.saveDBEntityAsync(house.id);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-disable-alarm`,
  })
  public onPlayerConfirmDisableAlarm(): void {
    const playerId: number = source;
    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(playerId);

    if (house && this.isHouseOwnedBy(house, playerId)) {
      house.alarm = 0;

      this.showHouseMenu(playerId);
      this.saveDBEntityAsync(house.id);
    }
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:request-buy-pet` })
  public onPlayerRequestBuyPet(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && this.isHouseOwnedBy(house, source)) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('pet_shop'),
        content: this.translate('pet_shop_description'),
        dialogId: 'buy-pet',
        dialogComponents: [
          {
            formControlName: 'selectedpet',
            type: 'stats',
            metadata: {
              items: global.exports['pets'].getPetsForUI().map((pet) => ({
                ...pet,
                [this.translate('price')]: `$${numberWithCommas(
                  pet[this.translate('price')]
                )}`,
              })),
            },
          },
        ],
        buttons: [
          {
            title: this.translate('close'),
          },
        ],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:select-pet`,
  })
  public onPlayerSelectPet(eventData: any): void {
    if (!eventData || !eventData.key) {
      return;
    }

    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);
    const pet = global.exports['pets'].getPetById(eventData.key);

    if (
      house &&
      pet &&
      Number(global.exports['authentication'].getPlayerInfo(source, 'cash')) >=
        Number(pet.price)
    ) {
      this.playersBuyingPets.set(source, pet);
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('pet_shop'),
        content: this.translate('pet_shop_select_pet_description', {
          price: numberWithCommas(Number(pet.price)),
        }),
        dialogId: 'confirm-buy-pet',
        dialogComponents: [
          {
            formControlName: 'petname',
            type: 'input',
            metadata: {
              label: this.translate('pet_name'),
              minLength: OPTIONS.PET_MIN_NAME_LENGTH,
              maxLength: OPTIONS.PET_MAX_NAME_LENGTH,
              requiredErrorMessage: this.translate('field_required'),
              requiredMinLengthMessage: this.translate('field_min_length', {
                length: OPTIONS.PET_MIN_NAME_LENGTH.toString(),
              }),
              requiredMaxLengthMessage: this.translate('field_max_length', {
                length: OPTIONS.PET_MAX_NAME_LENGTH.toString(),
              }),
            },
            required: true,
          },
        ],
        buttons: [{ title: this.translate('confirm') }],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-buy-pet`,
  })
  public onPlayerConfirmBuyPet({ form: { petname } }): void {
    const playerId: number = source;
    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(playerId);
    const pet = this.playersBuyingPets.get(playerId);
    const cash = Number(
      global.exports['authentication'].getPlayerInfo(playerId, 'cash')
    );

    if (
      petname.length < OPTIONS.PET_MIN_NAME_LENGTH ||
      petname.length > OPTIONS.PET_MAX_NAME_LENGTH
    ) {
      return;
    }

    if (
      house &&
      this.isHouseOwnedBy(house, playerId) &&
      pet &&
      cash >= Number(pet.price)
    ) {
      global.exports['authentication'].setPlayerInfo(
        playerId,
        'cash',
        cash - Number(pet.price)
      );

      house.pet = {
        name: toTitleCase(petname),
        pedId: this.playersBuyingPets.get(playerId).key,
      };

      this.playersBuyingPets.delete(playerId);
      this.showHouseMenu(playerId);
      this.saveDBEntityAsync(house.id);

      global.exports['pets'].createPet(house.pet, house.id);

      const playersInThisVirtualWorld = this.virtualWorldsWithPlayers.get(
        house.id
      );
      if (playersInThisVirtualWorld?.length) {
        const defaultHouseInteriorIndex: number =
          this.getHouseInteriorIndex(house);

        global.exports['pets'].spawnPetForPlayerInVirtualWorld(
          playerId,
          house.id,
          HOUSE_PETS_DEFAULTS[defaultHouseInteriorIndex].spawnPos,
          this.isHouseOwnedBy(house, playerId),
          NetworkGetNetworkIdFromEntity(GetPlayerPed(playerId))
        );
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-rehome-pet`,
  })
  public onPlayerRequestRehomePet(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);
    const pet = <any>house.pet;

    if (
      house &&
      this.isHouseOwnedBy(house, source) &&
      Object.keys(house.pet).length > 0
    ) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: this.translate('pet_set_for_adoption'),
        content: this.translate('pet_set_for_adoption_confirmation', {
          name: pet.name,
        }),
        dialogId: 'confirm-rehome-pet',
        buttons: [{ title: this.translate('confirm') }],
      });
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-rehome-pet`,
  })
  public onPlayerConfirmRehomePet(): void {
    const house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (
      house &&
      this.isHouseOwnedBy(house, source) &&
      Object.keys(house.pet).length > 0
    ) {
      house.pet = {};
      this.showHouseMenu(source);
      this.saveDBEntityAsync(house.id);

      global.exports['pets'].removePet(house.id);

      const playersInThisVirtualWorld: number[] =
        this.virtualWorldsWithPlayers.get(house.id);
      if (playersInThisVirtualWorld) {
        global.exports['pets'].despawnPetForPlayers(playersInThisVirtualWorld);
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-become-tenant`,
  })
  public onPlayerRequestBecomeTenant(): void {
    const house: House = this.getClosestEntityOfSameTypeToPlayer(source);
    const playerDBId: number = Number(
      global.exports['authentication'].getPlayerInfo(source, 'id')
    );

    if (
      house.owner &&
      house.rentPrice > 0 &&
      house.rentPrice <=
        Number(global.exports['authentication'].getPlayerInfo(source, 'cash'))
    ) {
      const rentPrice: number = house.rentPrice;
      const alreadyRentedHouse: House = this.entities.find((_house: House) =>
        getTenants(house).includes(playerDBId)
      );

      if (alreadyRentedHouse) {
        console.log(
          `The player is already a tenant to house ${alreadyRentedHouse.id}!`
        );
        return;
      }

      global.exports['authentication'].setPlayerInfo(
        source,
        'cash',
        Number(global.exports['authentication'].getPlayerInfo(source, 'cash')) -
          rentPrice
      );
      addTenants(house, playerDBId);
      TriggerClientEvent(
        `${GetCurrentResourceName()}:house-became-tenant`,
        source,
        house
      );
      this.teleportIntoHouse(source, house);
      this.saveDBEntityAsync(house.id);
    }
  }

  @EventListener({ eventName: 'inventory:client-give-to-additional-inventory' })
  public onInventoryItemDraggedIntoAdditionalInventory(item: Item): void {
    if (
      (ITEM_MAPPINGS[item._piKey]?.isTransferrable &&
        !ITEM_MAPPINGS[item._piKey]?.isTransferrable(item.image)) ||
      !ITEM_MAPPINGS[item._piKey]?.isRefridgeratable(item.image)
    ) {
      return;
    }

    if (this.playersInspectingFridges.has(source)) {
      /*
      TODO: if (fridge has sufficient space to add an item) (should work when incrementing item)
      */
      const existingItemFromPlayerInventoryData: any = global.exports[
        'authentication'
      ].getPlayerInfo(source, item._piKey);

      this.playersInspectingFridges.set(source, {
        ...this.playersInspectingFridges.get(source),
        inspectionType: FRIDGE_INSPECTION_TYPE.TRANSFER_TO_FRIDGE,
      });

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
    }
  }

  @EventListener({ eventName: 'inventory:client-receive-item' })
  public onInventoryItemRequestTakeFromAdditionalInventory(item: Item): void {
    if (
      (ITEM_MAPPINGS[item._piKey]?.isTransferrable &&
        !ITEM_MAPPINGS[item._piKey]?.isTransferrable(item.image)) ||
      !ITEM_MAPPINGS[item._piKey]?.isRefridgeratable(item.image)
    ) {
      return;
    }

    if (this.playersInspectingFridges.has(source)) {
      const virtualWorld: number = this.getPlayerVirtualWorld(source);
      const house: House = this.entities.find(
        (_house: House) => _house.id === virtualWorld
      );

      if (
        virtualWorld === 0 ||
        !house ||
        !this.isPlayerAtFridge(source, house)
      ) {
        return;
      }

      /*
      TODO: if (player has sufficient space for this)
      */
      const currentFridgeItems: Item[] = ItemConstructor.bundle(
        new ItemConstructor(
          () => house.fridge,
          'items',
          undefined,
          this.translationLanguage
        ).get()
      );

      const existingItemOfSameType: Item = currentFridgeItems.find(
        (_existingItem: Item) => _existingItem._piKey === item._piKey
      );

      if (existingItemOfSameType) {
        this.playersInspectingFridges.set(source, {
          ...this.playersInspectingFridges.get(source),
          inspectionType: FRIDGE_INSPECTION_TYPE.TRANSFER_FROM_FRIDGE_TO_ME,
        });

        emit('inventory:show-trade-dialog', source, {
          item: {
            ...item,
            value: ITEM_MAPPINGS[item._piKey]?.bruteAmount
              ? ITEM_MAPPINGS[item._piKey]?.bruteAmount(
                  item.image,
                  house.fridge
                )
              : item.value,
          },
        });
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

    if (this.playersInspectingFridges.has(_target)) {
      const virtualWorld: number = this.getPlayerVirtualWorld(source);
      const house: House = this.entities.find(
        (_house: House) => _house.id === virtualWorld
      );

      if (
        virtualWorld === 0 ||
        !house ||
        !this.isPlayerAtFridge(source, house)
      ) {
        return;
      }

      if (
        this.playersInspectingFridges.get(_target).inspectionType ===
        FRIDGE_INSPECTION_TYPE.TRANSFER_TO_FRIDGE
      ) {
        /*
        if (player does not have that amount in the inventory) {
          return;
        } 
        */
        let currentFridgeItems: Item[] = ItemConstructor.bundle(
          new ItemConstructor(
            () => house.fridge,
            'items',
            undefined,
            this.translationLanguage
          ).get()
        );

        currentFridgeItems = currentFridgeItems.filter(
          (item: Item) => item._piKey !== data.item._piKey
        );

        house.fridge = new ItemConstructor(
          () => house.fridge,
          data.item._piKey,
          undefined,
          this.translationLanguage
        ).incrementFromSource(
          global.exports['authentication'].getPlayerInfo(
            source,
            data.item._piKey
          ) || undefined,
          data.amount,
          data.item.image
        );

        // It is IMPORTANT for this to be executed AFTER the fridge incremention/decremention above
        global.exports['inventory'].consumePlayerItem(
          _target,
          data.item,
          data.amount
        );

        this.saveDBEntityAsync(house.id);
      } else if (
        this.playersInspectingFridges.get(_target).inspectionType ===
        FRIDGE_INSPECTION_TYPE.TRANSFER_FROM_FRIDGE_TO_ME
      ) {
        house.fridge = new ItemConstructor(
          () => house.fridge,
          data.item._piKey,
          undefined,
          this.translationLanguage
        ).incrementFromSource(
          global.exports['authentication'].getPlayerInfo(
            source,
            data.item._piKey
          ) || undefined,
          -data.amount,
          data.item.image
        );

        // It is IMPORTANT for this to be executed AFTER the fridge incremention/decremention above
        global.exports['inventory'].givePlayerItem(
          _target,
          data.item,
          data.amount
        );

        this.saveDBEntityAsync(house.id);
      }

      this.playersInspectingFridges.set(_target, {
        ...this.playersInspectingFridges.get(_target),
        inspectionType: FRIDGE_INSPECTION_TYPE.IDLE,
      });

      this.checkFridge(source);
    }
  }

  protected override async loadDBEntities(): Promise<House[]> {
    const entitiesLoaded: House[] = await super.loadDBEntities();

    entitiesLoaded.forEach((house: House) => {
      if (Object.keys(house.pet)?.length) {
        global.exports['pets'].createPet(house.pet, house.id);
      }
    });

    return entitiesLoaded;
  }

  @Command({ adminLevelRequired: 6 })
  public createHouse(source: number, args: any[]): void {
    if (args.length < 3) {
      console.log('Syntax: /createhouse <interior> <price> <level>!');
      return;
    }
    const interior: number = Number(args[0]);
    const price: number = Number(args[1]);
    const level: number = Number(args[2]);
    const position: number[] = GetEntityCoords(GetPlayerPed(source), true);

    this.createEntity({
      owner: '',
      level,
      entranceX: position[0],
      entranceY: position[1],
      entranceZ: position[2],
      firstPurchasePrice: price,
      exitX: HOUSE_INTERIORS[interior].pos[0],
      exitY: HOUSE_INTERIORS[interior].pos[1],
      exitZ: HOUSE_INTERIORS[interior].pos[2],
      sellingPrice: 0,
      rentPrice: 0,
      tenantIds: [],
      pet: {},
    } as House);
  }

  @Command({ adminLevelRequired: 6 })
  public removeHouse(source: number, args: any[]): void {
    let house: House = this.getClosestEntityOfSameTypeToPlayer(source);
    if (args && args[0]) {
      house =
        this.getEntityByDBId(Number(args[0])) ||
        this.getClosestEntityOfSameTypeToPlayer(source);
    }

    if (!house) {
      console.log('Failed - House undefined');
      return;
    }

    console.log(
      global.exports['authentication'].getPlayerInfo(source, 'name'),
      'removed a house!'
    );
    this.removeEntity(house);
  }

  @Command()
  public enterHouse(source: number): void {
    const house: HouseExtended =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);
    if (!house) {
      console.log('couldnt find a valid house');
      return;
    }

    const isOwnedByMe: boolean = house.ownerInstance === source;

    if (
      !(
        isOwnedByMe ||
        house.tenantIds.includes(
          Number(global.exports['authentication'].getPlayerInfo(source, 'id'))
        )
      )
    ) {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:force-showui`,
        source,
        house
      );
    } else {
      this.teleportIntoHouse(source, house);
    }
  }

  @Command({ adminLevelRequired: 3 })
  public ramHouse(source: number, args: any[]): void {
    let house: House = this.getClosestEntityOfSameTypeToPlayer(source);
    if (args && args[0]) {
      house =
        this.getEntityByDBId(Number(args[0])) ||
        this.getClosestEntityOfSameTypeToPlayer(source);
    }

    if (!house) {
      console.log('Failed - House undefined');
      return;
    }

    console.log(
      global.exports['authentication'].getPlayerInfo(source, 'name'),
      'rammed into a house!'
    );
    this.teleportIntoHouse(source, house);
  }

  @Command()
  public exitHouse(source: number): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house) {
      this.teleportOutsideOfHouse(source, house);
    }
  }

  @Command()
  public houseMenu(source: number): void {
    this.showHouseMenu(source);
  }

  @Command()
  public checkFridge(source: number): void {
    const virtualWorld: number = this.getPlayerVirtualWorld(source);
    const house: House = this.entities.find(
      (_house: House) => _house.id === virtualWorld
    );

    if (virtualWorld === 0 || !house) {
      console.log('Failed to show fridge menu to ', GetPlayerName(source));
      return;
    }

    emit(
      'inventory:client-inventory-request',
      source,
      ItemConstructor.withCustomizations(
        {
          title: this.translate('fridge'),
          items: ItemConstructor.bundle(
            new ItemConstructor(
              () => ({ fridge_documents: 1 }),
              'items',
              undefined,
              this.translationLanguage
            ).get(),
            new ItemConstructor(
              (() => house.fridge).bind(this),
              'items',
              undefined,
              this.translationLanguage
            ).get()
          ),
        },
        {
          topLeft: () => '',
        }
      )
    );

    this.playersInspectingFridges.set(source, {
      houseId: house.id,
      inspectionType: FRIDGE_INSPECTION_TYPE.IDLE,
    });
  }

  protected syncWithClients(client?: number): void {
    super.syncWithClients(client);

    if (client) {
      const playerName: string = global.exports['authentication'].getPlayerInfo(
        client,
        'name'
      );
      const housesOwnedByPlayer: House[] = this.entities.filter(
        (house: House) => house.owner === playerName
      );

      if (housesOwnedByPlayer.length) {
        global.exports['authentication'].setPlayerInfo(
          client,
          'housekeys',
          housesOwnedByPlayer.map((house: House) => house.id)
        );
      }
    }
  }

  private showHouseMenu(playerId: number): void {
    const virtualWorld: number = this.getPlayerVirtualWorld(playerId);
    const house: House = this.entities.find(
      (_house: House) => _house.id === virtualWorld
    );

    if (virtualWorld === 0 || !house) {
      console.log('Failed to show housemenu to ', GetPlayerName(playerId));
      return;
    }

    const businesses = global.exports['businesses'].getEntities();

    const taxes: number = Math.floor(
      Number(0.0005 * house.firstPurchasePrice) +
        businesses.find(
          (business: any) => business.name === 'Electricity Company'
        )?.productPrice ||
        100 +
          businesses.find((business: any) => business.name === 'Gas Company')
            ?.productPrice ||
        100
    );

    // TODO: When a house owner changes the rent price, all the tenants should keep the previous rent price unless new rent price is accepted

    TriggerClientEvent(
      `${GetCurrentResourceName()}-menu:force-showui`,
      playerId,
      {
        stats: [
          { key: this.translate('level'), value: house.level },
          { key: this.translate('tenants'), value: house.tenantIds?.length },
          {
            key: this.translate('max_income'),
            value:
              '$' + numberWithCommas(house.tenantIds?.length * house.rentPrice),
          },
          { key: `${this.translate('security')}(%)`, value: '0%' },
          {
            key: this.translate('pet_shortened'),
            value: (<any>house.pet).name
              ? (<any>house.pet).name
              : Object.keys(house.pet).length > 0
              ? global.exports['pets'].getPetNiceNameById(
                  (<any>house.pet).pedId
                )
              : this.translate('none'),
          },
          { key: this.translate('pet_status'), value: 'Happy' },
          {
            key: this.translate('price'),
            value:
              house.sellingPrice > 0
                ? `$${numberWithCommas(house.sellingPrice)}`
                : this.translate('house_not_for_sale'),
          },
          {
            key: this.translate('value'),
            value: '$' + numberWithCommas(house.firstPurchasePrice),
          },
          {
            key: this.translate('rent_price'),
            value: `$${numberWithCommas(house.rentPrice)}/${this.translate(
              'hour_shortened'
            )}`,
          },
          { key: this.translate('upgrades'), value: '0/3' },
          {
            key: this.translate('taxes'),
            value: `$${numberWithCommas(taxes)}/${this.translate(
              'hour_shortened'
            )}`,
          },
          {
            key: this.translate('pet_expenses'),
            value: `$50/${this.translate('hour_shortened')}`,
          },
        ],
        items: house.tenantIds.map((_tenant: number) => ({
          outline: '#404158',
          topLeft: '1',
          bottomRight: '',
          width: 65,
          image: '1',
        })),
        leftMenu: {
          description: this.translate('house_management'),
          buttons: [
            {
              title: !house.sellingPrice
                ? this.translate('house_set_for_sale_shortened')
                : this.translate('house_set_for_sale_stop'),
              subtitle: !house.sellingPrice
                ? this.translate('house_set_for_sale_short_description')
                : this.translate('house_set_for_sale_stop_short_description'),
              icon: 'sell',
              unlocked: !!house.sellingPrice,
              disabled: false,
            },
            {
              title: this.translate('house_sell_to_bank'),
              subtitle: this.translate('house_sell_to_bank_short_description'),
              icon: 'account_balance',
            },
            {
              title: !house.rentPrice
                ? this.translate('house_enable_rent')
                : this.translate('house_disable_rent'),
              subtitle: !house.rentPrice
                ? this.translate('house_enable_rent_short_description')
                : this.translate('house_disable_rent_short_description'),
              icon: 'supervisor_account',
              unlocked: !!house.rentPrice,
              disabled: false,
            },
            {
              title: this.translate('house_tenants_evict_all'),
              subtitle: this.translate(
                'house_tenants_evict_all_short_description'
              ),
              icon: 'logout',
              disabled: !house.tenantIds.length,
              tooltip: this.translate('house_tenants_evict_no_tenants'),
            },
          ],
        },
        rightMenu: {
          description: this.translate('house_upgrades'),
          buttons: [
            {
              title: !house.alarm
                ? this.translate('house_upgrade_alarm')
                : this.translate('burglar_alarm_disable'),
              subtitle: !house.alarm
                ? this.translate('house_upgrade_alarm_short_description', {
                    price: numberWithCommas(
                      this.computePriceByRate(OPTIONS.ALARM_PRICE_RATE)
                    ),
                  })
                : this.translate('burglar_alarm_disable_short_description'),
              unlocked: house.alarm === 1,
              icon: 'access_alarms',
              disabled: false,
            },
            {
              title: this.translate('pet'),
              subtitle: this.translate('pet_short_description'),
              icon: 'pets',
              disabled: Object.keys(house.pet).length > 0,
              tooltip: this.translate(
                'pet_already_have_pet_shortened_description'
              ),
            },
            {
              title: this.translate('pet_set_for_adoption'),
              subtitle: this.translate(
                'pet_set_for_adoption_short_description'
              ),
              icon: 'heart_broken',
              disabled: !Object.keys(house.pet).length,
              tooltip: this.translate('pet_no_pets'),
            },
          ],
        },
        title: this.translate('house_headline', {
          owner: house.owner,
          id: house.id.toString(),
        }),
      }
    );
  }

  private isPlayerAtFridge(source: number, house: House): boolean {
    const defaultHouseInteriorIndex: number = this.getHouseInteriorIndex(house);

    const playerPosition: number[] = GetEntityCoords(
      GetPlayerPed(source),
      true
    );

    if (
      isPlayerInRangeOfPoint(
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        HOUSE_INTERIORS[defaultHouseInteriorIndex].fridgePos[0],
        HOUSE_INTERIORS[defaultHouseInteriorIndex].fridgePos[1],
        HOUSE_INTERIORS[defaultHouseInteriorIndex].fridgePos[2],
        2.0
      )
    ) {
      return true;
    }

    return false;
  }

  private teleportIntoHouse(source: number, house: HouseExtended): void {
    SetEntityCoords(
      GetPlayerPed(source),
      house.exitX,
      house.exitY,
      house.exitZ,
      true,
      false,
      false,
      true
    );
    this.setPlayerVirtualWorld(source, house.id);

    if (Object.keys(house.pet)?.length) {
      const defaultHouseInteriorIndex: number =
        this.getHouseInteriorIndex(house);

      const ownerInHouse: boolean =
        !house.ownerInstance ||
        this.virtualWorldsWithPlayers
          .get(house.id)
          .includes(house.ownerInstance);

      global.exports['pets'].spawnPetForPlayerInVirtualWorld(
        source,
        house.id,
        HOUSE_PETS_DEFAULTS[defaultHouseInteriorIndex].spawnPos,
        this.isHouseOwnedBy(house, source),
        ownerInHouse
          ? NetworkGetNetworkIdFromEntity(GetPlayerPed(house.ownerInstance))
          : -1
      );
    }
  }

  private teleportOutsideOfHouse(source: number, house: House): void {
    SetEntityCoords(
      GetPlayerPed(source),
      house.entranceX,
      house.entranceY,
      house.entranceZ,
      true,
      false,
      false,
      true
    );
    this.setPlayerVirtualWorld(source, 0);
    global.exports['pets'].despawnPetsForPlayer(source);
  }

  @Export()
  public getClosestHouse(playerId: number): House {
    return this.getClosestEntityOfSameTypeToPlayer(playerId);
  }

  @Export()
  public getClosestHouseExit(playerId: number): House {
    return this.getClosestEntityOfSameTypeExitToPlayer(playerId);
  }

  @EventListener({ eventName: 'inventory:on-force-hidden' })
  public onInventoryHidden(): void {
    if (this.playersInspectingFridges.has(source)) {
      this.playersInspectingFridges.delete(source);
    }
  }

  @EventListener()
  public onPlayerAuthenticate(playerAuthenticated: number, player): void {
    super.onPlayerAuthenticate(playerAuthenticated, player);

    this.getEntities().forEach((house) => {
      if (house.ownerId === player.id) {
        (<HouseExtended>house).ownerInstance = playerAuthenticated;
      }
    });
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();

    if (this.playersInspectingFridges.has(source)) {
      this.playersInspectingFridges.delete(source);
    }

    if (this.playersBuyingPets.has(source)) {
      this.playersBuyingPets.delete(source);
    }

    this.getEntities().forEach((house) => {
      if ((<HouseExtended>house).ownerInstance === source) {
        (<HouseExtended>house).ownerInstance = null;
      }
    });
  }

  private isHouseOwnedBy(house: HouseExtended, playerId: number): boolean {
    return house.ownerInstance === playerId;
  }

  private getHouseInteriorIndex(house: House): number | null {
    return (
      HOUSE_INTERIORS.indexOf(
        HOUSE_INTERIORS.find(
          (_dhi) =>
            Math.floor(_dhi.pos[0]) === Math.floor(house.exitX) &&
            Math.floor(_dhi.pos[1]) === Math.floor(house.exitY) &&
            Math.floor(_dhi.pos[2]) === Math.floor(house.exitZ)
        )
      ) ?? null
    );
  }

  private computePriceByRate(priceRate: number): number {
    return Math.floor(
      priceRate * /*TODO: Replace with price of most expensive car*/ 10000000
    );
  }
}

export const OPTIONS = {
  PET_MAX_NAME_LENGTH: 24,
  PET_MIN_NAME_LENGTH: 3,
  ALARM_PRICE_RATE: 0.00001,
};
