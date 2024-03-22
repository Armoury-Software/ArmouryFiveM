import { ISessionItem, ArraySessionItem } from '@armoury/fivem-framework';
import { IItemBase } from '@armoury/fivem-roleplay-gamemode';

export class SessionItems extends ArraySessionItem<IItemBase> implements ISessionItem<Array<IItemBase>> {
  public constructor() {
    super('items', [], true, 'player_items', [
      {
        name: 'identifier',
        type: 'varchar(128)',
      },
      {
        name: 'value',
        type: 'varchar(1024)',
      },
    ]);
  }
}
