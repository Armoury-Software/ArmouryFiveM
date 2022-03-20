import { ServerController } from '../../../../[utils]/server/server.controller';
import { Business } from '../../../../businesses/src/shared/models/business.interface';
import { Item } from '../../../../inventory/src/shared/item-list.model';
import { ItemConstructor } from '../../../../inventory/src/client/helpers/inventory-item.constructor';
import { EXTERNAL_INVENTORY_MAPPINGS } from '../../../../inventory/src/shared/external-inventory.mappings';
import { BASE_ITEM_PRICES } from '../../shared/item.prices';
import { numberWithCommas } from '../../../../[utils]/utils';

export class Server extends ServerController {
  protected _businessUsableName: string = '';

  public constructor() {
    super();

    this.assignListeners();

    this._businessUsableName = this.toBusinessUsableName(
      GetCurrentResourceName().split('-')[1]
    );

    if (!GetCurrentResourceName().includes('businesses-')) {
      console.error(
        "You are using a Business-specific controller but its name does NOT comply with the naming 'businesses-<businessNameStripped>'. The resource may not work properly."
      );
    }
  }

  private assignListeners(): void {
    onNet(
      'businesses:business-interact-request',
      (source: number, business: Business) => {
        if (
          this.toBusinessUsableName(business.name) === this._businessUsableName
        ) {
          emit(
            'inventory:client-inventory-request',
            source,
            ItemConstructor.withCustomizations(
              EXTERNAL_INVENTORY_MAPPINGS[this._businessUsableName],
              {
                topLeft: () => '',
                bottomRight: (value: Item) =>
                  `$${numberWithCommas(BASE_ITEM_PRICES[value.image] || 100)}`,
                value: (value: Item) => BASE_ITEM_PRICES[value.image],
              }
            )
          );
        }
      }
    );

    onNet(`inventory:client-receive-item`, (item: Item) => {
      const business = global.exports['businesses'].getClosestBusiness(source);

      if (business && business.name === '24/7') {
        emit(`inventory:show-purchase-dialog`, source, {
          myMoney: Number(
            global.exports['authentication'].getPlayerInfo(source, 'cash')
          ),
          item,
        });
      }
    });

    onNet(
      `inventory:client-confirm-purchase`,
      (data: { item: Item; amount: number }) => {
        const business =
          global.exports['businesses'].getClosestBusiness(source);

        if (business && business.name === '24/7') {
          const playerMoney: number = Number(
            global.exports['authentication'].getPlayerInfo(source, 'cash')
          );
          const itemTotalPrice: number =
            BASE_ITEM_PRICES[data.item.image] * data.amount;

          if (playerMoney < itemTotalPrice) {
            return;
          }

          global.exports['inventory'].givePlayerItem(
            source,
            data.item,
            data.amount
          );

          global.exports['authentication'].setPlayerInfo(
            source,
            'cash',
            playerMoney - itemTotalPrice
          );
        }
      }
    );
  }

  private toBusinessUsableName(businessName: string): string {
    return businessName.replace('/', '').toLowerCase();
  }
}
