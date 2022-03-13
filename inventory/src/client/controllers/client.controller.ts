import { ItemList } from '../../shared/item-list.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { phoneFormatted } from '../../../../[utils]/utils';
import { Weapons } from '../../../../weapons/src/shared/models/weapon.model'
import { WEAPON_NAMES } from '../../../../weapons/src/shared/weapon'

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
      const weapons: Weapons = typeof(this.getPlayerInfo('weapons')) === 'object' ? <Weapons>this.getPlayerInfo('weapons') : {};
      const phone: number = Number(this.getPlayerInfo('phone'));

      let mappedWeapons: { name: string, ammo: number }[] = [];
      for (let weapon in weapons) {
        mappedWeapons.push(
          {
            name: weapon.toString(),
            ammo: weapons[weapon].ammo
          }
        );
      }

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
        weapons: mappedWeapons.map((weapon: { name: string, ammo: number }) => ({
          topLeft: WEAPON_NAMES[weapon.name],
          bottomRight: `${weapon.ammo % GetWeaponClipSize(weapon.name)}/${weapon.ammo / GetWeaponClipSize(weapon.name)}`,
          outline: '#6e2937',
          image: 'ak-47',
          width: 100,
          type: 'Rifle',
          description: `A weapon.`
        })),
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
