import {
  Item,
  AdditionalInventory,
  ItemList,
} from '../../shared/item-list.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { EXTERNAL_INVENTORY_MAPPINGS } from '../../shared/external-inventory.mappings';
import { ItemConstructor } from '../../client/helpers/inventory-item.constructor';

export class Server extends ServerController {
  public constructor() {
    super();

    this.assignListeners();
    this.assignExports();
  }

  public givePlayerItem(playerId: number, item: Item, amount: any): void {
    global.exports['authentication'].setPlayerInfo(
      playerId,
      item._piKey,
      new ItemConstructor(
        (playerInfoKey: string) =>
          global.exports['authentication'].getPlayerInfo(
            playerId,
            playerInfoKey
          ),
        item._piKey
      ).incrementFromSource(undefined, amount, item.image),
      false
    );

    emit(`inventory:client-inventory-request`, playerId);
  }

  public consumePlayerItem(playerId: number, item: Item, amount: any): void {
    global.exports['authentication'].setPlayerInfo(
      playerId,
      item._piKey,
      new ItemConstructor(
        (playerInfoKey: string) =>
          global.exports['authentication'].getPlayerInfo(
            playerId,
            playerInfoKey
          ),
        item._piKey
      ).incrementFromSource(undefined, -amount, item.image),
      false
    );

    emit(`inventory:client-inventory-request`, playerId);
  }

  private assignListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:client-inventory-request`,
      (
        source: number,
        extraInventoryMapping?: string | AdditionalInventory
      ) => {
        let additionalPanel!: AdditionalInventory;

        if (!source) {
          source = global.source;
        }

        if (extraInventoryMapping) {
          if (typeof extraInventoryMapping === 'string') {
            additionalPanel =
              EXTERNAL_INVENTORY_MAPPINGS[extraInventoryMapping];
          } else if (typeof extraInventoryMapping === 'object') {
            additionalPanel = extraInventoryMapping;
          }
        }

        // prettier-ignore
        const items: ItemList = {
          house_keys: ItemConstructor.bundle(
            new ItemConstructor(this.inventoryPIFunction(source), 'housekeys', 'house').get()
          ),
          business_keys: ItemConstructor.bundle(
            new ItemConstructor(this.inventoryPIFunction(source), 'businesskeys', 'business').get()
          ),
          vehicles: [],
          weapons: ItemConstructor.bundle(
            new ItemConstructor(this.inventoryPIFunction(source), 'weapons', 'weapon').get()
          ),
          misc: ItemConstructor.bundle(
            new ItemConstructor(this.inventoryPIFunction(source), 'cash').get(),
            new ItemConstructor(this.inventoryPIFunction(source), 'phone').get(),
            new ItemConstructor(this.inventoryPIFunction(source), 'items').get()
          ),
        };

        TriggerClientEvent(
          `${GetCurrentResourceName()}:force-showui`,
          source || global.source,
          {
            items,
            additionalPanel,
          }
        );
      }
    );

    onNet(
      `${GetCurrentResourceName()}:show-purchase-dialog`,
      (source: number, data: any) => {
        TriggerClientEvent(
          `${GetCurrentResourceName()}:cshow-purchase-dialog`,
          source || global.source,
          data
        );
      }
    );
  }

  private assignExports(): void {
    exports('consumePlayerItem', this.consumePlayerItem.bind(this));
    exports('givePlayerItem', this.givePlayerItem.bind(this));
  }

  private inventoryPIFunction(target: number): Function {
    return ((playerInfoKey: string) =>
      global.exports['authentication'].getPlayerInfo(
        target,
        playerInfoKey
      )).bind(this);
  }
}
