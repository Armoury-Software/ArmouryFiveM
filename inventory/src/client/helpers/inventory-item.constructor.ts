import { ITEM_MAPPINGS } from '../../shared/item-mappings';
import { CATEGORY_MAPPINGS } from '../../shared/category-mappings';
import { Item } from '../../shared/item-list.model';

export class ItemConstructor {
  public constructor(
    protected readonly func: Function,
    protected readonly playerInfoKey: string,
    protected readonly category: string = 'misc'
  ) {}

  public get(): Item | Item[] {
    const value: number | string | number[] | string[] | object = this.func(
      this.playerInfoKey
    );

    if (
      value === -1 ||
      (Array.isArray(value) && !value.length) ||
      (typeof value === 'object' && !Object.keys(value).length)
    ) {
      return null;
    }

    const originalMapped = {
      ...CATEGORY_MAPPINGS[this.category],
      ...ITEM_MAPPINGS[this.playerInfoKey],
    };

    if (ITEM_MAPPINGS[this.playerInfoKey].insertionCondition) {
      const insertionConditionResult: boolean =
        ITEM_MAPPINGS[this.playerInfoKey].insertionCondition(value);

      if (!insertionConditionResult) {
        return null;
      }
    }

    // prettier-ignore
    return (
      (
        Array.isArray(value)
          ? value
          : (
            typeof(value) === 'object'
              ? Object.keys(value).map((key) => [key, value[key]])
              : [value]
          )
      )
        .map((_value) => ({
          ...originalMapped,
          image: CATEGORY_MAPPINGS[this.category].image || (ITEM_MAPPINGS[this.playerInfoKey].image ? ITEM_MAPPINGS[this.playerInfoKey].image(_value) : undefined) || this.playerInfoKey,
          bottomRight: ITEM_MAPPINGS[this.playerInfoKey].value
            ? ITEM_MAPPINGS[this.playerInfoKey].value(_value)
            : CATEGORY_MAPPINGS[this.category].value
            ? CATEGORY_MAPPINGS[this.category].value(_value)
            : JSON.stringify(_value),
          type:
            originalMapped.type ||
            (CATEGORY_MAPPINGS[this.category].useCategoryNameAsType
              ? this.category
              : 'item'),
          description: ITEM_MAPPINGS[this.playerInfoKey].description
            ? ITEM_MAPPINGS[this.playerInfoKey].description(_value)
            : 'Just an inventory item.',
          // TODO: Find a case where topLeft is different than 1?
          topLeft:
            CATEGORY_MAPPINGS[this.category].topLeft ||
            (ITEM_MAPPINGS[this.playerInfoKey].topLeft ? ITEM_MAPPINGS[this.playerInfoKey].topLeft(_value) : undefined) ||
            '1',
        })));
  }

  public static bundle(...items: (Item | Item[])[]): Item[] {
    const itemsToReturn: Item[] = [];
    items
      .filter((item) => item)
      .forEach((item: Item | Item[]) => {
        if (Array.isArray(item)) {
          itemsToReturn.push(...item);
        } else {
          itemsToReturn.push(item);
        }
      });

    return itemsToReturn;
  }
}
