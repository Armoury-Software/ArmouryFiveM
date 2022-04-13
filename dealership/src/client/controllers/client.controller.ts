import { ClientWithUIController } from '@core/client/client-ui.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { Delay } from '@core/utils';

import { Dealership } from '@shared/models/dealership.interface';

@FiveMController()
export class Client extends ClientWithUIController {
  // TODO: Vehicle model request and spawn should be stopped if the player pressed the arrow keys while the vehicle is loading
  private currentlyViewedVehicle: number = NaN;
  private currentDealershipCamera: number = NaN;

  public constructor() {
    super();

    this.addUIListener('previous-vehicle');
    this.addUIListener('next-vehicle');
    this.addUIListener('confirm-purchase');
    this.addUIListener('dialog-button-pressed');
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:show-dialog` })
  public onPlayerShouldSeeDialog(dialogData: any): void {
    SendNuiMessage(
      JSON.stringify({
        ...dialogData,
        type: 'open-dialog',
      })
    );
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:db-send-entities` })
  public onDealershipsInformationReceived(dealerships: Dealership[]) {
    this.clearMarkers();
    this.clearBlips();
    this.clearActionPoints();

    dealerships.forEach((dealership: Dealership) => {
      this.createMarkers([
        {
          marker: dealership.markerId,
          pos: [
            dealership.entranceX,
            dealership.entranceY,
            dealership.entranceZ,
          ],
          rgba: [169, 196, 228, 255],
          renderDistance: 35.0,
          scale: 1.2,
          rotation: [0.0, 0.0, 0.0],
          underlyingCircle: {
            marker: 25,
            scale: 1.75,
            rgba: [169, 196, 228, 255],
          },
        },
      ]);

      if (dealership.blipId > 0) {
        this.createBlips([
          {
            id: dealership.blipId,
            color: 43,
            title: `Dealership - ${dealership.title}`,
            pos: [
              dealership.entranceX,
              dealership.entranceY,
              dealership.entranceZ,
            ],
          },
        ]);
      }

      this.createActionPoints({
        pos: [dealership.entranceX, dealership.entranceY, dealership.entranceZ],
        action: () => {
          DisableControlAction(0, 38, true);
          DisableControlAction(0, 68, true);
          DisableControlAction(0, 86, true);
          DisableControlAction(0, 29, true);

          BeginTextCommandDisplayHelp('STRING');
          AddTextComponentSubstringPlayerName(
            `Press ~INPUT_PICKUP~ to enter this dealership.`
          );
          EndTextCommandDisplayHelp(0, false, true, 1);

          if (IsDisabledControlJustPressed(0, 38)) {
            // TODO: Currently, server-sidedly when /enterfaction is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
            ExecuteCommand('enterdealership');
          }

          if (IsDisabledControlJustPressed(0, 29)) {
            ExecuteCommand('enterdealership');
          }
        },
      });
    });
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (!(IsScreenFadedOut() || IsScreenFadingOut() || IsScreenFadingIn())) {
      if (eventName === 'previous-vehicle') {
        console.log(
          '(client.controller.ts:) Received NFX previous-vehicle POST request. Sending event..'
        );
        TriggerServerEvent(
          `${GetCurrentResourceName()}:request-previous-vehicle`,
          eventData.dealershipId,
          eventData.currentIndex
        );
      }

      if (eventName === 'next-vehicle') {
        console.log(
          '(client.controller.ts:) Received NFX next-vehicle POST request. Sending event..'
        );
        TriggerServerEvent(
          `${GetCurrentResourceName()}:request-next-vehicle`,
          eventData.dealershipId,
          eventData.currentIndex
        );
      }
    }

    if (eventName === 'confirm-purchase') {
      TriggerServerEvent(`${GetCurrentResourceName()}:want-to-buy`, eventData);
    }

    if (eventName === 'dialog-button-pressed') {
      TriggerServerEvent(
        `${GetCurrentResourceName()}:dialog-button-pressed`,
        eventData
      );
    }
  }

  public onForceShowUI(data: any): void {
    super.onForceShowUI(data);
    this.updateUIData(data);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();

    if (!isNaN(this.currentDealershipCamera)) {
      setImmediate(async () => {
        DoScreenFadeOut(500);
        await Delay(500);

        RenderScriptCams(false, false, 0, true, true);
        SetCamActive(this.currentDealershipCamera, false);
        this.currentDealershipCamera = NaN;
        this.clearViewedVehicle();

        await Delay(1500);
        TriggerServerEvent(`${GetCurrentResourceName()}:tp-me-back`);

        await Delay(500);
        DoScreenFadeIn(500);
      });
    }
  }

  private async updateUIData(data: any): Promise<void> {
    DoScreenFadeOut(500);
    await Delay(500);

    if (isNaN(this.currentlyViewedVehicle)) {
      this.currentDealershipCamera = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
      SetCamCoord(
        this.currentDealershipCamera,
        data.camera.pos[0],
        data.camera.pos[1],
        data.camera.pos[2]
      );
      PointCamAtCoord(
        this.currentDealershipCamera,
        data.camera.vehicle.pos[0],
        data.camera.vehicle.pos[1],
        data.camera.vehicle.pos[2]
      );
      SetCamActive(this.currentDealershipCamera, true);
      RenderScriptCams(true, false, 0, true, true);
    } else {
      this.clearViewedVehicle();
    }

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        vehicle: JSON.stringify(data.vehicle),
      })
    );

    console.log('created vehicle!');

    this.createVehicleAsync(
      data.camera.vehicle.hash,
      data.camera.vehicle.pos[0],
      data.camera.vehicle.pos[1],
      data.camera.vehicle.pos[2],
      data.camera.vehicle.pos[3],
      false,
      false,
      true
    ).then((vehicleId: number) => {
      this.currentlyViewedVehicle = vehicleId;
    });

    await Delay(1500);
    DoScreenFadeIn(500);
  }

  private clearViewedVehicle(): void {
    if (!isNaN(this.currentlyViewedVehicle)) {
      DeleteEntity(this.currentlyViewedVehicle);
      this.currentlyViewedVehicle = NaN;
    }
  }
}
