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

  private inventoryPIFunction(target: number): Function {
    return ((playerInfoKey: string) =>
      global.exports['authentication'].getPlayerInfo(
        target,
        playerInfoKey
      )).bind(this);
  }
}
