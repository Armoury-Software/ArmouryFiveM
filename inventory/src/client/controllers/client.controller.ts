import { ItemList } from '../../shared/item-list.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { Delay, phoneFormatted } from '../../../../[utils]/utils';
import { Weapons } from '../../../../weapons/src/shared/models/weapon.model';
import { WEAPON_NAMES } from '../../../../weapons/src/shared/weapon';

export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.registerKeyBindings();

    this.addUIListener('inventory-item-dropped');

    this.addDebugPeds();
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    this.removeFromTick(`${GetCurrentResourceName()}_inventorygive`);
  }

  public onForceShowUI(data: any): void {
    super.onForceShowUI(data);
  }

  private showInventoryUI(): void {
    let houseKeys: number | number[] = <number[]>(
      this.getPlayerInfo('housekeys')
    );
    let businessKeys: number | number[] = <number[]>(
      this.getPlayerInfo('businesskeys')
    );
    const weapons: Weapons =
      typeof this.getPlayerInfo('weapons') === 'object'
        ? <Weapons>this.getPlayerInfo('weapons')
        : {};
    const phone: number = Number(this.getPlayerInfo('phone'));

    let mappedWeapons: { name: string; ammo: number }[] = [];
    for (let weapon in weapons) {
      mappedWeapons.push({
        name: weapon.toString(),
        ammo: weapons[weapon].ammo,
      });
    }

    const items: ItemList = {
      house_keys: (!Array.isArray(houseKeys) ? [houseKeys] : houseKeys)
        .filter((key: number) => key !== -1)
        .map((key: number) => ({
          topLeft: '1',
          bottomRight: '#' + key,
          outline: '#293577',
          image: 'key',
          width: 65,
          type: 'house',
          description: `A clean key made of brass. Unlocks the door to House #${key}.`,
        })),
      business_keys: (!Array.isArray(businessKeys)
        ? [businessKeys]
        : businessKeys
      )
        .filter((key: number) => key !== -1)
        .map((key: number) => ({
          topLeft: '1',
          bottomRight: '#' + key,
          outline: '#31644f',
          image: 'key',
          width: 65,
          type: 'business',
          description: `A clean key made of brass. Unlocks the door to Business #${key}.`,
        })),
      vehicles: [],
      weapons: mappedWeapons.map((weapon: { name: string; ammo: number }) => ({
        topLeft: WEAPON_NAMES[weapon.name],
        bottomRight: weapon.ammo.toString(),
        outline: '#6e2937',
        image: 'ak-47',
        width: 100,
        type: 'Rifle',
        description: `A weapon.`,
      })),
      misc: [
        ...(phone > 0
          ? [
              {
                topLeft: '1',
                bottomRight: phoneFormatted(phone),
                outline: '#878b9f',
                image: 'phone',
                width: 65,
                type: 'general',
                description: `A slick phone with numerous functionalities. SIM number: ${phoneFormatted(
                  phone
                )}.`,
              },
            ]
          : []),
      ],
    };

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        items: JSON.stringify(items),
      })
    );

    this.addToTickUnique({
      id: `${GetCurrentResourceName()}_inventorygive`,
      function: () => {
        this.showClosestPedsICanOfferTo();
      },
    });
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    switch (eventName) {
      case 'inventory-item-dropped': {
        console.log(eventData);
        break;
      }
    }
  }

  private registerKeyBindings(): void {
    RegisterCommand(
      '+inventory',
      () => {
        this.showUI();
        this.showInventoryUI();
      },
      false
    );

    RegisterKeyMapping('+inventory', 'Open inventory', 'keyboard', 'i');
  }

  private addDebugPeds(): void {
    this.createPedAsync(
      0,
      GetHashKey('a_f_m_downtown_01'),
      123.2835,
      -2667.7188,
      5.9934,
      0,
      true,
      true
    );

    this.createPedAsync(
      0,
      GetHashKey('a_f_y_femaleagent'),
      120.2769,
      -2671.6353,
      5.9934,
      0,
      true,
      true
    );

    this.createPedAsync(
      0,
      GetHashKey('a_f_m_prolhost_01'),
      124.1934,
      -2663.5913,
      5.9934,
      0,
      true,
      true
    );
  }

  private async draw(x, y, z) {
    let [visible, x1, y1] = GetScreenCoordFromWorldCoord(x, y, z);

    if (visible) {
      if (!HasStreamedTextureDictLoaded('inventorysprites')) {
        RequestStreamedTextureDict('inventorysprites', true);

        while (!HasStreamedTextureDictLoaded('inventorysprites')) {
          await Delay(100);
        }
      } else {
        const cursorPosition: number[] = GetNuiCursorPosition();
        const realScreenPosition: number[] =
          this.getRealScreenCoordsFromOffsets(x1, y1);

        if (
          Math.abs(cursorPosition[0] - realScreenPosition[0]) < 36 &&
          Math.abs(cursorPosition[1] - realScreenPosition[1]) < 36
        ) {
          DrawSprite(
            'inventorysprites',
            'inventory-give-selected',
            x1,
            y1,
            0.08,
            0.14,
            0,
            255,
            255,
            255,
            255
          );
        } else {
          DrawSprite(
            'inventorysprites',
            'inventory-give',
            x1,
            y1,
            0.08,
            0.14,
            0,
            255,
            255,
            255,
            255
          );
        }
      }
    }
  }

  private showClosestPedsICanOfferTo(): void {
    let [handle, _entity]: [number, number] = FindFirstPed(0);

    let found: boolean = true;
    while (found) {
      let [f, entity]: [boolean, number] = FindNextObject(handle);
      found = f;

      if (entity !== GetPlayerPed(-1)) {
        let coords = GetEntityCoords(entity, true);
        this.draw(coords[0], coords[1], coords[2]);
      }
    }

    EndFindObject(handle);
  }

  private getRealScreenCoordsFromOffsets(
    X: number,
    Y: number
  ): [number, number] {
    const screenResolution: [number, number] = GetActiveScreenResolution();
    return [screenResolution[0] * X, screenResolution[1] * Y];
  }
}
