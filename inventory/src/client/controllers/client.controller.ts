import { ItemList } from '../../shared/item-list.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { phoneFormatted } from '../../../../[utils]/utils';
import { Weapons } from '../../../../weapons/src/shared/models/weapon.model'

export class Client extends ClientWithUIController {
    public constructor() {
      super();

      this.registerKeyBindings();
    }

    public onForceHideUI(): void {
      super.onForceHideUI();
    }

    public onForceShowUI(data: any): void {
      super.onForceShowUI(data);
    }

    private showInventoryUI(): void {
      let houseKeys: number | number[] = <number[]>this.getPlayerInfo('housekeys');
      let businessKeys: number | number[] = <number[]>this.getPlayerInfo('businesskeys');
      let weapons: Weapons = this.getPlayerInfo('weapons');
      const phone: number = Number(this.getPlayerInfo('phone'));

      const items: ItemList = {
        house_keys: (!Array.isArray(houseKeys) ? [houseKeys] : houseKeys).filter((key: number) => (key !== -1)).map((key: number) => ({
          topLeft: '1',
          bottomRight: '#' + key,
          outline: '#293577',
          image: 'key',
          width: 65,
          type: 'house',
          description: `A clean key made of brass. Unlocks the door to House #${key}.`
        })),
        business_keys: (!Array.isArray(businessKeys) ? [businessKeys] : businessKeys).filter((key: number) => (key !== -1)).map((key: number) => ({
          topLeft: '1',
          bottomRight: '#' + key,
          outline: '#31644f',
          image: 'key',
          width: 65,
          type: 'business',
          description: `A clean key made of brass. Unlocks the door to Business #${key}.`
        })),
        vehicles: [],
        weapons: /*(!Array.isArray(weapons) ? [weapons] : weapons).map((name: string) => ({
          topLeft: '1',
          bottomRight: name + ', ' + weapons[name].ammo,
          outline: '#293577',
          image: name,
          width: 65,
          type: 'weapons',
          description: `A weapon.`
        })),*/[],
        misc: [
          ...(phone > 0 ? [{
              topLeft: '1',
              bottomRight: phoneFormatted(phone),
              outline: '#878b9f',
              image: 'phone',
              width: 65,
              type: 'general',
              description: `A slick phone with numerous functionalities. SIM number: ${phoneFormatted(phone)}.`
          }] : [])
        ]
      };

      SendNuiMessage(JSON.stringify({
          type: 'update',
          resource: GetCurrentResourceName(),
          items: JSON.stringify(items)
      }));
    }

    private registerKeyBindings(): void {
      RegisterCommand('+inventory', () => {
          this.showUI();
          this.showInventoryUI();
      }, false);

      RegisterKeyMapping('+inventory', 'Open inventory', 'keyboard', 'i');
    }
}
