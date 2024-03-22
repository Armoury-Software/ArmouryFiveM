import { ItemConstructor } from './helpers/inventory-item.constructor';
import { Item } from './item-list.model';

// TODO: Add logic for adding items to this inventory mapping and sync between resources
// prettier-ignore
export const EXTERNAL_INVENTORY_MAPPINGS = (language: string): { [key: string]: ExternalInventoryMapping } => ({
  247: {
    title: '24/7',
    items: ItemConstructor.bundle(
      new ItemConstructor(() => ({
          apple: 1000,
          chocolate: 1000,
          donut: 1000,
          sandwich: 1000,
          water: 1000,
          coke: 1000,
          red_bull: 1000,
          cold_coffee: 1000,
          beer_can: 1000,
          rum: 1000,
          whiskey: 1000,
          champagne: 1000,
          bandages: 1000,
          medkit: 1000,
          fuel_cannister: 1000,
          toolbox: 1000
        }),
        'items',
        undefined,
        language
      ).get()
    ),
  },
  trunk: {
    title: 'Trunk',
    items: ItemConstructor.bundle(
        new ItemConstructor(() => ({
            vehicle_documents: 1
          }),
          'items',
          undefined,
          language
        ).get()
    ),
  },
  factionvehiclekeys: {
    title: 'Faction Keys',
    items: ItemConstructor.bundle(
      new ItemConstructor(() => ({
          vehicle_documents: 1
        }),
        'items',
        undefined,
        language
      ).get()
    ),
  },
});

export interface ExternalInventoryMapping {
  title: string;
  items: Item[];
}
