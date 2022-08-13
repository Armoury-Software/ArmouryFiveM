import { ClientWithUIController } from '@core/client/client-ui.controller';
import {
  Command,
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientWithUIController {
  private currentCamera: number = NaN;
  private createdPeds: number[] = [];

  constructor() {
    super();

    this.addUIListener('page-selected');
    this.addUIListener('decision-made');
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'page-selected') {
      const data: { page: string } = eventData;

      TriggerServerEvent(`${GetCurrentResourceName()}:init-pairs`, data.page);
    } else if (eventName === 'decision-made') {
      const data: { page: string; approved: boolean } = eventData;

      TriggerServerEvent(
        `${GetCurrentResourceName()}:decision-made`,
        data.page,
        data.approved
      );
    }
  }

  public onForceShowUI(data: any): void {
    super.onForceShowUI(data);

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        clothesCombinations: JSON.stringify(data),
        page: 'reset',
      })
    );

    this.initialize();
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    if (!isNaN(this.currentCamera)) {
      SetCamActive(this.currentCamera, false);
      RenderScriptCams(false, false, 0, true, true);
      DestroyCam(this.currentCamera, true);
      this.currentCamera = NaN;

      this.createdPeds.forEach((_ped) => {
        DeleteEntity(_ped);
      });

      this.createdPeds = [];
    }

    SetPedComponentVariation(PlayerPedId(), 0, 0, 0, 2); // Face
    SetPedComponentVariation(PlayerPedId(), 2, 1, 4, 0); // Hair
    SetPedComponentVariation(PlayerPedId(), 4, 4, 2, 0); //  Pantalon
    SetPedComponentVariation(PlayerPedId(), 6, 1, 0, 2); //  Shoes
    SetPedComponentVariation(PlayerPedId(), 11, 0, 8, 0); // Jacket
  }

  @Command()
  public getDrawableIdLimitFor([componentId]: [number]): void {
    console.log(
      GetNumberOfPedDrawableVariations(PlayerPedId(), Number(componentId))
    );
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:update-for-peds` })
  public onShouldUpdateForPedsAsWell(components: number[]): void {
    console.log('recevied components for peds', components);
    this.createdPeds.forEach((ped) => {
      components.forEach((drawableId, componentId) => {
        SetPedComponentVariation(
          ped,
          componentId,
          drawableId === -1 ? 0 : drawableId,
          drawableId === -1 ? 500 : 0,
          0
        );
      });
    });
  }

  private async initialize(): Promise<void> {
    this.createdPeds = [
      await this.createPedAsync(
        0,
        GetHashKey('mp_m_freemode_01'),
        -1124.903076171875 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        -3206.748046875 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        14.29257583618164,
        147.5832977294922,
        true,
        true
      ),
      await this.createPedAsync(
        0,
        GetHashKey('mp_m_freemode_01'),
        -1124.1004638671876 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        -3205.63232421875 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        14.29389858245849,
        56.4035530090332,
        true,
        true
      ),
      await this.createPedAsync(
        0,
        GetHashKey('mp_m_freemode_01'),
        -1123.1712646484376 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        -3204.157470703125 +
          10.0 *
            GetPlayerServerId(PlayerId()) *
            Math.pow(-1, GetPlayerServerId(PlayerId())),
        14.29562187194824,
        321.0484619140625,
        true,
        true
      ),
    ];

    SetEntityCoords(
      PlayerPedId(),
      -1123.742431640625 +
        10.0 *
          GetPlayerServerId(PlayerId()) *
          Math.pow(-1, GetPlayerServerId(PlayerId())),
      -3204.879150390625 +
        10.0 *
          GetPlayerServerId(PlayerId()) *
          Math.pow(-1, GetPlayerServerId(PlayerId())),
      14.294771194458,
      true,
      false,
      false,
      false
    );
    SetEntityHeading(PlayerPedId(), 238.3940887451172);

    this.currentCamera = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
    // prettier-ignore
    SetCamCoord(this.currentCamera, -1120.700927734375 + (10.0 * GetPlayerServerId(PlayerId()) * Math.pow(-1, GetPlayerServerId(PlayerId()))), -3206.77587890625 + (10.0 * GetPlayerServerId(PlayerId()) * Math.pow(-1, GetPlayerServerId(PlayerId()))), 14.29315280914306);
    // prettier-ignore
    PointCamAtCoord(this.currentCamera, -1123.742431640625 + (10.0 * GetPlayerServerId(PlayerId()) * Math.pow(-1, GetPlayerServerId(PlayerId()))), -3204.879150390625 + (10.0 * GetPlayerServerId(PlayerId()) * Math.pow(-1, GetPlayerServerId(PlayerId()))), 14.294771194458);
    SetCamActive(this.currentCamera, true);
    RenderScriptCams(true, false, 0, true, true);
  }
}
