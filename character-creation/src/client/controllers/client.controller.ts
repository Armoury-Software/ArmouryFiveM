import { ClientWithUIController } from '@core/client/client-ui.controller';
import {
  Command,
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { Delay } from '@core/utils';

import { Character, CharacterUpdate } from '@shared/character.interface';

// TODO: REMOVE CLOTHING PAIRS IMPORTS!!!
import { UPPER_ITEMS_WITH_HANDS } from '../../server/clothing.pairs';

@FiveMController()
export class Client extends ClientWithUIController {
  private cameras: { [key: string]: number } = {};
  private activeCamera: number = NaN;

  constructor() {
    super();

    this.addUIListener('select-character');
    this.addUIListener('on-updated');
  }

  public onForceShowUI(data: any): void {
    if (!this.isUIShowing()) {
      this.initializeModel();
      this.initializeCameras();
    }

    super.onForceShowUI(data);

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        characters: JSON.stringify(data.characters),
        uppershirts: JSON.stringify(data.uppershirts),
        undershirts: JSON.stringify(data.undershirts),
        accessories: JSON.stringify(data.accessories),
      })
    );

    this.selectCamera(this.cameras.general);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    if (!isNaN(this.cameras.general)) {
      setImmediate(async () => {
        DoScreenFadeOut(500);
        await Delay(500);

        this.destroyCameras();

        await Delay(1500);
        DoScreenFadeIn(500);
      });
    }
  }

  private selectCamera(camera: number, ease: boolean = false): void {
    if (camera !== this.activeCamera) {
      if (ease) {
        SetCamActiveWithInterp(camera, this.activeCamera, 400, 4, 1);
      } else {
        SetCamActive(camera, true);
      }

      this.activeCamera = camera;
      RenderScriptCams(true, false, 0, true, true);

      Object.keys(this.cameras).forEach((_camera) => {
        if (!isNaN(this.cameras[_camera]) && this.cameras[_camera] !== camera) {
          SetCamActive(this.cameras[_camera], false);
        }
      });
    }
  }

  private initializeCameras(): void {
    if (Object.keys(this.cameras).length === 0) {
      // prettier-ignore
      this.cameras.general = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
      // prettier-ignore
      SetCamCoord(this.cameras.general, -1577.88818359375, -3006.24609375, -79.0058517456054);
      // prettier-ignore
      PointCamAtCoord(this.cameras.general, -1575.4031982421876, -3006.4501953125, -79.00585174560547);

      // prettier-ignore
      this.cameras.face = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
      // prettier-ignore
      SetCamCoord(this.cameras.face, -1576.0843505859376, -3007.53857421875, -78.40605773925781);
      // prettier-ignore
      PointCamAtCoord(this.cameras.face, -1575.706298828125, -3007.5390625, -78.40605773925781);

      // prettier-ignore
      this.cameras.body = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
      // prettier-ignore
      SetCamCoord(this.cameras.body, -1576.7647705078126, -3007.538330078125, -79.00605010986328);
      // prettier-ignore
      PointCamAtCoord(this.cameras.body, -1575.706298828125, -3007.5390625, -79.0058517456054);

      // prettier-ignore
      this.cameras.face_side = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
      // prettier-ignore
      SetCamCoord(this.cameras.face_side, -1575.31884765625, -3007.18896484375, -78.40605773925781);
      // prettier-ignore
      PointCamAtCoord(this.cameras.face_side, -1575.3323974609376, -3007.513916015625, -78.40605773925781);
    }
  }

  private destroyCameras(): void {
    RenderScriptCams(false, false, 0, true, true);
    Object.keys(this.cameras).forEach((camera) => {
      if (!isNaN(this.cameras[camera])) {
        SetCamActive(this.cameras[camera], false);
        DestroyCam(this.cameras[camera], true);
      }
      this.cameras[camera] = NaN;
    });
    this.activeCamera = NaN;
  }

  private async initializeModel(): Promise<void> {
    const model: number = GetHashKey('mp_m_freemode_01');

    if (IsModelInCdimage(model) && IsModelValid(model)) {
      RequestModel(model);

      let attempts: number = 0;
      while (!HasModelLoaded(model)) {
        if (attempts > 10) {
          return;
        }

        await Delay(100);
        attempts++;
      }

      SetPlayerModel(PlayerId(), model);

      const ped = PlayerPedId();

      // If male:
      if (model === GetHashKey('mp_m_freemode_01')) {
        SetPedComponentVariation(ped, 0, 0, 0, 2); // Face
        SetPedComponentVariation(ped, 2, 1, 4, 0); // Hair
        SetPedComponentVariation(ped, 4, 4, 2, 0); //  Pantalon
        SetPedComponentVariation(ped, 6, 1, 0, 2); //  Shoes
        SetPedComponentVariation(ped, 11, 0, 8, 0); // Jacket
      } else {
        SetPedComponentVariation(ped, 0, 21, 0, 0); // Face
        SetPedComponentVariation(ped, 2, 11, 4, 0); // Hair
        SetPedComponentVariation(ped, 4, 6, 1, 0); //  Pantalon
        SetPedComponentVariation(ped, 6, 1, 1, 2); //  Shoes
        SetPedComponentVariation(ped, 8, 2, 0, 0); // Undershirt
        SetPedComponentVariation(ped, 11, 23, 1, 0); // Jacket
      }

      SetModelAsNoLongerNeeded(model);
    }
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'select-character') {
      TriggerServerEvent(
        `${GetCurrentResourceName()}:character-selected`,
        <Character>eventData
      );
    } else if (eventName === 'on-updated') {
      TriggerServerEvent(
        `${GetCurrentResourceName()}:character-updated`,
        <CharacterUpdate>eventData
      );
    }
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:change-camera` })
  public onCharacterCreationCameraShouldChange(camera: string): void {
    this.selectCamera(this.cameras[camera], true);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:update-clothing-pairs`,
  })
  public onClothingPairsShouldChange(data): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'update-pairs',
        uppershirts: JSON.stringify(data.uppershirts),
        undershirts: JSON.stringify(data.undershirts),
        accessories: JSON.stringify(data.accessories),
        uppershirtsTextureIds: data.uppershirtsTextureIds,
        undershirtsTextureIds: data.undershirtsTextureIds,
        accessoriesTextureIds: data.accessoriesTextureIds,
        legsTextureIds: data.legsTextureIds,
        shoesTextureIds: data.shoesTextureIds,
        masksTextureIds: data.masksTextureIds,
      })
    );
  }

  // TODO: Remove these commands (only keep non-dev ones)
  @Command()
  public csetPedComponentVariation(args: any[]): void {
    SetPedComponentVariation(
      PlayerPedId(),
      Number(args[0]),
      Number(args[1]),
      Number(args[2]),
      Number(args[3])
    );

    console.log(`Done! Setting component variation with args:`, args);
  }

  @Command()
  public csetPedFaceFeature(args: any[]): void {
    SetPedHeadBlendData(PlayerPedId(), 0, 0, 0, 0, 0, 0, 0, 0, 0, false);
    SetPedFaceFeature(PlayerPedId(), Number(args[0]), Number(args[1]));

    console.log(`Done! Setting ped face feature with args:`, args);
  }

  // TODO: Remove this upon release
  @Command()
  public generateMaleTextureVariationLimits(): void {
    const playerPed = PlayerPedId();
    const uppershirts = new Array(
      GetNumberOfPedDrawableVariations(playerPed, 11)
    )
      .fill(0)
      .map((_item, index) => index);
    const accessories = new Array(
      GetNumberOfPedDrawableVariations(playerPed, 7)
    )
      .fill(0)
      .map((_item, index) => index);
    const undershirts = new Array(
      GetNumberOfPedDrawableVariations(playerPed, 8)
    )
      .fill(0)
      .map((_item, index) => index);
    const shoes = new Array(GetNumberOfPedDrawableVariations(playerPed, 6))
      .fill(0)
      .map((_item, index) => index);
    const legs = new Array(GetNumberOfPedDrawableVariations(playerPed, 4))
      .fill(0)
      .map((_item, index) => index);
    const masks = new Array(GetNumberOfPedDrawableVariations(playerPed, 1))
      .fill(0)
      .map((_item, index) => index);
    const hairs = new Array(GetNumberOfPedDrawableVariations(playerPed, 2))
      .fill(0)
      .map((_item, index) => index);

    let uppershirts_textureIds: { [key: number]: number[] } = {};
    let accessories_textureIds: { [key: number]: number[] } = {};
    let undershirts_textureIds: { [key: number]: number[] } = {};
    let shoes_textureIds: { [key: number]: number[] } = {};
    let legs_textureIds: { [key: number]: number[] } = {};
    let masks_textureIds: { [key: number]: number[] } = {};
    let hairs_textureIds: { [key: number]: number[] } = {};

    uppershirts.forEach((uppershirt) => {
      uppershirts_textureIds[uppershirt] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 11, uppershirt)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    accessories.forEach((accessory) => {
      accessories_textureIds[accessory] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 7, accessory)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    undershirts.forEach((undershirt) => {
      undershirts_textureIds[undershirt] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 8, undershirt)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    shoes.forEach((shoe) => {
      shoes_textureIds[shoe] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 6, shoe)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    legs.forEach((leg) => {
      legs_textureIds[leg] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 4, leg)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    masks.forEach((mask) => {
      masks_textureIds[mask] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 1, mask)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    hairs.forEach((hair) => {
      hairs_textureIds[hair] = new Array(
        GetNumberOfPedTextureVariations(playerPed, 2, hair)
      )
        .fill(0)
        .map((_item, index) => index);
    });

    TriggerServerEvent(
      `${GetCurrentResourceName()}:texture-variation-limits`,
      uppershirts_textureIds,
      accessories_textureIds,
      undershirts_textureIds,
      shoes_textureIds,
      legs_textureIds,
      masks_textureIds,
      hairs_textureIds
    );
  }
}
