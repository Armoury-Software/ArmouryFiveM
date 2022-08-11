import { ITEM_MAPPINGS } from '../item-mappings';
import { CATEGORY_MAPPINGS } from '../category-mappings';
import { AdditionalInventory, Item } from '../item-list.model';
import { PlayerInfoType } from '../../../../authentication/src/shared/models/player-info.type';

export class ItemConstructor {
  public constructor(
    protected readonly func: Function,
    protected readonly playerInfoKey: string,
    protected readonly category?: string
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

    const computedCategory: string =
      this.category ||
      ITEM_MAPPINGS[this.playerInfoKey]?.defaultCategory ||
      'misc';

    const originalMapped = {
      ...CATEGORY_MAPPINGS[computedCategory],
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
          image: CATEGORY_MAPPINGS[computedCategory].image || (ITEM_MAPPINGS[this.playerInfoKey].image ? ITEM_MAPPINGS[this.playerInfoKey].image(_value) : undefined) || this.playerInfoKey,
          bottomRight: ITEM_MAPPINGS[this.playerInfoKey].value
            ? ITEM_MAPPINGS[this.playerInfoKey].value(_value)
            : CATEGORY_MAPPINGS[computedCategory].value
            ? CATEGORY_MAPPINGS[computedCategory].value(_value)
            : JSON.stringify(_value),
          type:
            originalMapped.type ||
            (CATEGORY_MAPPINGS[computedCategory].useCategoryNameAsType
              ? computedCategory
              : 'item'),
          description: ITEM_MAPPINGS[this.playerInfoKey].description
            ? ITEM_MAPPINGS[this.playerInfoKey].description(_value)
            : 'Just an inventory item.',
          topLeft:
            CATEGORY_MAPPINGS[computedCategory].topLeft ||
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

    let _newSourceValue: PlayerInfoType = sourceValue
      ? JSON.parse(JSON.stringify(sourceValue))
      : undefined;

    if (CATEGORY_MAPPINGS[this.category]?.incrementor) {
      return CATEGORY_MAPPINGS[this.category]?.incrementor(
        _newPastValue,
        key,
        amount,
        _newSourceValue
      );
    }

    if (ITEM_MAPPINGS[this.playerInfoKey].incrementor) {
      return ITEM_MAPPINGS[this.playerInfoKey].incrementor(
        _newPastValue,
        key,
        amount,
        _newSourceValue
      );
    }

    if (this.playerInfoKey === 'factionvehiclekeys') {
      console.log('key:', key);
      console.log('amount:', amount);
    }

    // prettier-ignore
    switch (typeof (sourceValue || _newPastValue)) {
      case 'number': {
        _newPastValue = (Number(_newPastValue) || 0) + Number(amount);

        if (sourceValue) {
          _newSourceValue = Number(_newSourceValue) - Number(amount);
        }

        break;
      }
      case 'object': {
        if (Array.isArray(_newPastValue)) {
          if (typeof amount === 'number') {
            (<number[]>_newPastValue).push(amount);

            if (sourceValue) {
              (<number[]>_newSourceValue).splice(
                (<number[]>_newSourceValue).indexOf(amount),
                1
              )
            }
          } else if (typeof amount === 'string') {
            (<string[]>_newPastValue).push(amount);

            if (sourceValue) {
              (<string[]>_newSourceValue).splice(
                (<string[]>_newSourceValue).indexOf(amount),
                1
              )
            }
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
