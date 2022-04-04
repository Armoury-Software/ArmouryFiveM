import {
  Command,
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerEntityWithEntranceController } from '@core/server/entity-controllers/server-entity-entrance.controller';
import { UIDialog } from '@core/models/ui-dialog.model';
import { isPlayerInRangeOfPoint, numberWithCommas } from '@core/utils';

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

@FiveMController()
export class Server extends ServerEntityWithEntranceController<House> {
  private playersInspectingFridges: Map<number, FridgeInspectionData> = new Map<
    number,
    FridgeInspectionData
  >();

  public constructor(dbTableName: string) {
    super(dbTableName, true);

    this.registerExports();
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-set-for-sale`,
  })
  public onPlayerRequestSetHouseForSale() {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && house.owner === GetPlayerName(source)) {
      if (!!house.sellingPrice) {
        house.sellingPrice = 0;
        this.saveDBEntityAsync(house.id);
        this.showHouseMenu(source);
        return;
      }

      // TODO: minValue and maxValue should be validated on the server in confirm-set-for-sale as well
      const minValue: number = 1000;
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: 'Set House for Sale',
        content:
          "Setting your house for sale will make your house show up as purchasable, and citizens will be able to call you directly while you're in the city.",
        dialogId: 'set-house-for-sale',
        dialogComponents: [
          {
            formControlName: 'housesellprice',
            type: 'slider',
            defaultValue: minValue,
            heading: 'Selling price',
            metadata: {
              min: minValue,
              max: house.firstPurchasePrice * 10,
              prefix: '$',
            },
          },
        ],
        buttons: [
          {
            title: 'Confirm',
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
      house.sellingPrice = Number(sellPrice);
      this.saveDBEntityAsync(house.id);
      this.showHouseMenu(source);
    }
  }

  @EventListener({ eventName: 'houses:request-sell-to-bank' })
  public onPlayerRequestSellToBank(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && house.owner === GetPlayerName(source)) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: `Sell To Bank (+$${numberWithCommas(
          house.firstPurchasePrice / 2
        )})`,
        content:
          'Are you sure you want to sell this house immediately? Selling your house to the bank gives you 50% of its original value. You will not own it anymore, and any pets will be lost. This action is irreversible.',
        dialogId: 'sell-house-to-bank',
        buttons: [
          {
            title: 'Confirm',
          },
        ],
      });
    }
  }

  @EventListener({ eventName: 'houses:confirm-sell-to-bank' })
  public onPlayerConfirmSellToBank(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && house.owner === GetPlayerName(source)) {
      house.owner = '';
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

    if (house && house.owner === GetPlayerName(source)) {
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
        title: 'Enable rent',
        content:
          'When rent is enabled, your house can hold tenants who pay rent for every hour spent in the city. You can evict tenants at any time.',
        dialogId: 'adjust-rent-price',
        dialogComponents: [
          {
            formControlName: 'houserentprice',
            type: 'slider',
            defaultValue: minValue,
            heading: 'Rent price ($/hr spent in city)',
            metadata: {
              min: minValue,
              max: maxValue,
              prefix: '$',
            },
          },
        ],
        buttons: [
          {
            title: 'Confirm',
          },
        ],
      });
    }
  }

  @EventListener({ eventName: 'houses:confirm-adjust-rent' })
  public onPlayerConfirmAdjustRent(rentPrice: number): void {
    // TODO: Do minValue and maxValue validations here! (also at house sell)
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house) {
      house.rentPrice = Number(rentPrice);
      this.saveDBEntityAsync(house.id);
      this.showHouseMenu(source);
    }
  }

  @EventListener({ eventName: 'houses:request-evict-tenants' })
  public onPlayerRequestEvictTenants(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && house.owner === GetPlayerName(source)) {
      TriggerClientEvent('houses-menu:show-dialog', source, {
        title: `Evict All Tenants (${house.tenantIds.length} tenants)`,
        content:
          'Are you sure you want to evict all tenants? This will kick them out of your house, and if you do this wrongfully, they can press charges!',
        dialogId: 'evict-all-tenants',
        buttons: [
          {
            title: 'Confirm',
          },
        ],
      });
    }
  }

  @EventListener({ eventName: 'houses:confirm-evict-tenants' })
  public onPlayerConfirmEvictTenants(): void {
    let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (house && house.owner === GetPlayerName(source)) {
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
    const house: House = this.getClosestEntityOfSameTypeToPlayer(source);

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

      if (!!house.owner) {
        const houseOwner: number = global.exports['authentication']
          .getAuthenticatedPlayers()
          .find(
            (authenticatedPlayer: number) =>
              GetPlayerName(authenticatedPlayer) === house.owner
          );

        if (houseOwner) {
          global.exports['phone'].executeCall(
            source,
            global.exports['authentication'].getPlayerInfo(houseOwner, 'phone')
          );
        }
      } else {
        // prettier-ignore
        TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, <UIDialog>{
          title: 'Purchase this house?',
          content: `Are you sure you want to purchase this house for $${numberWithCommas(
            housePrice
          )}?`,
          buttons: [{ title: 'Confirm' }],
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
      const house: House = this.getClosestEntityOfSameTypeToPlayer(_source);

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
        const housePreviousOwner: string = house.owner;

        house.owner = global.exports['authentication'].getPlayerInfo(
          _source,
          'name'
        );

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
        } else {
          house.owner = housePreviousOwner;
        }
      }
    })(source);
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
      TODO: if (trunk has sufficient space to add an item) (should work when incrementing item)
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
        new ItemConstructor(() => house.fridge, 'items').get()
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
          new ItemConstructor(() => house.fridge, 'items').get()
        );

        currentFridgeItems = currentFridgeItems.filter(
          (item: Item) => item._piKey !== data.item._piKey
        );

        house.fridge = new ItemConstructor(
          () => house.fridge,
          data.item._piKey
        ).incrementFromSource(
          global.exports['authentication'].getPlayerInfo(
            source,
            data.item._piKey
          ) || undefined,
          data.amount,
          data.item.image
        );

        // It is IMPORTANT for this to be executed AFTER the trunk incremention/decremention above
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
          data.item._piKey
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

  @Command(6)
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

  @Command(6)
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

    const isOwnedByMe: boolean =
      house.owner ===
      global.exports['authentication'].getPlayerInfo(source, 'name');

    if (
      !(
        isOwnedByMe ||
        house.tenantIds.includes(
          Number(global.exports['authentication'].getPlayerInfo(source, 'id'))
        )
      )
    ) {
      house.ownerInstance = -1;

      if (!isOwnedByMe && !!house.owner) {
        const authenticatedPlayers: number[] =
          global.exports['authentication'].getAuthenticatedPlayers();
        house.ownerInstance =
          authenticatedPlayers.find(
            (authenticatedPlayer: number) =>
              GetPlayerName(authenticatedPlayer) === house.owner
          ) || -1;
      }

      TriggerClientEvent(
        `${GetCurrentResourceName()}:force-showui`,
        source,
        house
      );
    } else {
      this.teleportIntoHouse(source, house);
    }
  }

  @Command(3)
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
          title: 'Fridge',
          items: ItemConstructor.bundle(
            new ItemConstructor(() => ({ fridge_documents: 1 }), 'items').get(),
            new ItemConstructor((() => house.fridge).bind(this), 'items').get()
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

    TriggerClientEvent(
      `${GetCurrentResourceName()}-menu:force-showui`,
      playerId,
      {
        stats: [
          { key: 'Level', value: house.level },
          { key: 'Tenants', value: house.tenantIds?.length },
          {
            key: 'Max Income',
            value:
              '$' + numberWithCommas(house.tenantIds?.length * house.rentPrice),
          },
          { key: 'Security(%)', value: '0%' },
          { key: 'Pet', value: 'German Shepherd' },
          { key: 'Pet Status', value: 'Happy' },
          {
            key: 'Price',
            value:
              house.sellingPrice > 0
                ? `$${numberWithCommas(house.sellingPrice)}`
                : 'Not for Sale',
          },
          {
            key: 'Value',
            value: '$' + numberWithCommas(house.firstPurchasePrice),
          },
          {
            key: 'Rent Price',
            value: `$${numberWithCommas(house.rentPrice)}/hr`,
          },
          { key: 'Upgrades', value: '0/3' },
          { key: 'Taxes', value: `$${numberWithCommas(taxes)}/hr` },
          { key: 'Pet Expenses', value: '$50/hr' },
        ],
        items: house.tenantIds.map((_tenant: number) => ({
          outline: '#404158',
          topLeft: '1',
          bottomRight: '',
          width: 65,
          image: '1',
        })),
        leftMenu: {
          description: 'House Management',
          buttons: [
            {
              title: !house.sellingPrice ? 'Set for Sale' : 'Stop Selling',
              subtitle: !house.sellingPrice
                ? 'Enable players to buy your house'
                : 'Set as no longer for sale',
              icon: 'sell',
              unlocked: !!house.sellingPrice,
              disabled: false,
            },
            {
              title: 'Sell to Bank',
              subtitle: 'Sell immediately for 50% value',
              icon: 'account_balance',
            },
            {
              title: !house.rentPrice ? 'Enable rent' : 'Disable rent',
              subtitle: !house.rentPrice
                ? 'Manage rent options'
                : 'Stop charging for rent',
              icon: 'supervisor_account',
              unlocked: !!house.rentPrice,
              disabled: false,
            },
            {
              title: 'Evict All Tenants',
              subtitle: 'Evict all tenants immediately',
              icon: 'logout',
              disabled: !house.tenantIds.length,
              tooltip: 'No tenants to evict',
            },
          ],
        },
        rightMenu: {
          description: 'House Upgrades',
          buttons: [
            {
              title: 'Alarm Upgrade',
              subtitle: 'Burglar protection for $1,000/hr',
              icon: 'access_alarms',
            },
            {
              title: 'Pet',
              subtitle: 'Buy a pet for your house',
              icon: 'pets',
            },
          ],
        },
        title: `House Menu - ${house.owner}'s House (#${house.id})`,
      }
    );
  }

  private isPlayerAtFridge(source: number, house: House): boolean {
    const defaultHouseInteriorIndex: number = HOUSE_INTERIORS.indexOf(
      HOUSE_INTERIORS.find(
        (_dhi) =>
          Math.floor(_dhi.pos[0]) === Math.floor(house.exitX) &&
          Math.floor(_dhi.pos[1]) === Math.floor(house.exitY) &&
          Math.floor(_dhi.pos[2]) === Math.floor(house.exitZ)
      )
    );

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

  private teleportIntoHouse(source: number, house: House): void {
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
      const defaultHouseInteriorIndex: number = HOUSE_INTERIORS.indexOf(
        HOUSE_INTERIORS.find(
          (_dhi) =>
            Math.floor(_dhi.pos[0]) === Math.floor(house.exitX) &&
            Math.floor(_dhi.pos[1]) === Math.floor(house.exitY) &&
            Math.floor(_dhi.pos[2]) === Math.floor(house.exitZ)
        )
      );

      const ownerIdInHouse: number = this.virtualWorldsWithPlayers
        .get(house.id)
        .find((playerId: number) => GetPlayerName(playerId) === house.owner);

      global.exports['pets'].spawnPetForPlayerInVirtualWorld(
        source,
        house.id,
        HOUSE_PETS_DEFAULTS[defaultHouseInteriorIndex].spawnPos,
        house.owner === GetPlayerName(source),
        ownerIdInHouse
          ? NetworkGetNetworkIdFromEntity(GetPlayerPed(ownerIdInHouse))
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

  private registerExports(): void {
    exports(
      'getClosestHouse',
      this.getClosestEntityOfSameTypeToPlayer.bind(this)
    );
    exports(
      'getClosestHouseExit',
      this.getClosestEntityOfSameTypeExitToPlayer.bind(this)
    );
  }

  @EventListener({ eventName: 'inventory:on-force-hidden' })
  public onInventoryHidden(): void {
    if (this.playersInspectingFridges.has(source)) {
      this.playersInspectingFridges.delete(source);
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();
    if (this.playersInspectingFridges.has(source)) {
      this.playersInspectingFridges.delete(source);
    }
  }
}
