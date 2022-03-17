import { ItemList } from '../../shared/item-list.model';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { Delay } from '../../../../[utils]/utils';
import { ItemConstructor } from '../helpers/inventory-item.constructor';

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
    // prettier-ignore
    const items: ItemList = {
      house_keys: ItemConstructor.bundle(
        new ItemConstructor(this.getPlayerInfo.bind(this), 'housekeys', 'house').get()
      ),
      business_keys: ItemConstructor.bundle(
        new ItemConstructor(this.getPlayerInfo.bind(this), 'businesskeys', 'business').get()
      ),
      vehicles: [],
      weapons: ItemConstructor.bundle(
        new ItemConstructor(this.getPlayerInfo.bind(this), 'weapons', 'weapon').get()
      ),
      misc: ItemConstructor.bundle(
        new ItemConstructor(this.getPlayerInfo.bind(this), 'cash').get(),
        new ItemConstructor(this.getPlayerInfo.bind(this), 'phone').get()
      ),
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
