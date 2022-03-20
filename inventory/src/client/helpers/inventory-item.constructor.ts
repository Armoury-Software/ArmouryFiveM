import { ITEM_MAPPINGS } from '../../shared/item-mappings';
import { CATEGORY_MAPPINGS } from '../../shared/category-mappings';
import { AdditionalInventory, Item } from '../../shared/item-list.model';
import { PlayerInfoType } from '../../../../authentication/src/shared/models/player-info.type';

export class ItemConstructor {
  public constructor(
    protected readonly func: Function,
    protected readonly playerInfoKey: string,
    protected readonly category: string = 'misc'
  ) {}

  public get(): Item | Item[] {
    const value: PlayerInfoType = this.func(this.playerInfoKey);

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
          topLeft:
            CATEGORY_MAPPINGS[this.category].topLeft ||
            (ITEM_MAPPINGS[this.playerInfoKey].topLeft ? ITEM_MAPPINGS[this.playerInfoKey].topLeft(_value) : undefined) ||
            '1',
          _piKey: this.playerInfoKey
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

  public static infinite<T extends number>(): T {
    return <T>999;
  }

  public static withCustomizations(
    externalInventoryMapping: AdditionalInventory,
    customizations: object
  ): AdditionalInventory {
    const _externalInventoryMapping: AdditionalInventory = JSON.parse(
      JSON.stringify(externalInventoryMapping)
    );

    Object.keys(customizations).forEach((property) => {
      _externalInventoryMapping.items.forEach((item: Item) => {
        item[property] = customizations[property](item);
      });
    });

    return _externalInventoryMapping;
  }

  public incrementFromSource(
    sourceValue?: PlayerInfoType,
    amount?: any,
    key?: number | string
  ): PlayerInfoType {
    let _newPastValue: PlayerInfoType = JSON.parse(
      JSON.stringify(this.func(this.playerInfoKey))
    );

    if (CATEGORY_MAPPINGS[this.category]?.incrementor) {
      return CATEGORY_MAPPINGS[this.category]?.incrementor(
        _newPastValue,
        key,
        amount
      );
    }

    if (ITEM_MAPPINGS[this.playerInfoKey].incrementor) {
      return ITEM_MAPPINGS[this.playerInfoKey].incrementor(
        _newPastValue,
        key,
        amount
      );
    }

    let _newSourceValue: PlayerInfoType = JSON.parse(
      JSON.stringify(sourceValue)
    );

    switch (typeof sourceValue) {
      case 'number': {
        _newPastValue = (Number(_newPastValue) || 0) + Number(amount);

        if (sourceValue) {
          _newSourceValue = Number(_newSourceValue) - Number(amount);
        }

        break;
      }
      case 'object': {
        if (Array.isArray(_newSourceValue) && Array.isArray(_newPastValue)) {
          if (typeof key === 'number') {
            (<number[]>_newPastValue).push(
              (<number[]>_newSourceValue).splice(
                (<number[]>_newSourceValue).indexOf(key),
                1
              )[0]
            );
          } else if (typeof key === 'string') {
            (<string[]>_newPastValue).push(
              (<string[]>_newSourceValue).splice(
                (<string[]>_newSourceValue).indexOf(key),
                1
              )[0]
            );
          }
        } else {
          if (typeof amount === 'number') {
            _newPastValue[key] = _newPastValue[key] + Number(amount);
          } else {
            _newPastValue[key] = _newSourceValue[key];
            delete _newSourceValue[key];
          }
        }
        break;
      }
    }

    return _newPastValue;
  }
}
