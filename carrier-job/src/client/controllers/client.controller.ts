import {
  CARRIER_MARKERS,
  CARRIER_QUICKSTART_POSITIONS,
} from '../../shared/positions';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { waitUntilThenDo } from '../../../../[utils]/utils';
import { UIButton } from '../../../../[utils]/models/ui-button.model';

export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.createBlips([
      {
        ...CARRIER_MARKERS.getJobMarker.blip,
        pos: CARRIER_MARKERS.getJobMarker.pos,
      },
    ]);

    this.createMarkers([CARRIER_MARKERS.getJobMarker]);

    this.createActionPoints({
      pos: CARRIER_MARKERS.getJobMarker.pos,
      action: () => {
        if (!this.isUIShowing() && !this.isUIOnCooldown()) {
          this.showCarrierMenu();
        }
      },
    });

    this.addControllerListeners();
    this.addUIListener('buttonclick');
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'buttonclick') {
      const data: { buttonId: number } = eventData;

      switch (data.buttonId) {
        case 0: {
          TriggerServerEvent(`${GetCurrentResourceName()}:quick-start`);
          this.hideUI();
          break;
        }
        case 1: {
          TriggerServerEvent(`${GetCurrentResourceName()}:get-job`);
          break;
        }
      }
    }
  }

  private showCarrierMenu(): void {
    this.updateUIData();
    this.showUI();
  }

  private addControllerListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:begin-route`,
      async (
        deliveryPosition: { X: number; Y: number; Z: number },
        shouldSpawnVehicle?: boolean
      ) => {
        if (shouldSpawnVehicle) {
          await this.createVehicleAsync(
            GetHashKey('Mule'),
            CARRIER_QUICKSTART_POSITIONS[0].pos[0],
            CARRIER_QUICKSTART_POSITIONS[0].pos[1],
            CARRIER_QUICKSTART_POSITIONS[0].pos[2],
            45.061977386475,
            true,
            true,
            true
          );
        }

        const deliveryPoint: number = this.createWaypoint(
          [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          'Job - Carrier - Delivery Point',
          69,
          652
        );

        this.createActionPoints({
          pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          action: () => {
            this.clearWaypoint(deliveryPoint);
            this.finishDelivery();
          },
          once: true,
        });
      }
    );

    onNet(
      `${GetCurrentResourceName()}:pickup-route`,
      async (deliveryPosition: { X: number; Y: number; Z: number }) => {
        const deliveryPoint: number = this.createWaypoint(
          [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          'Job - Carrier - Pickup Point',
          81,
          652
        );

        this.createActionPoints({
          pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          action: () => {
            this.clearWaypoint(deliveryPoint);
            TriggerServerEvent(`${GetCurrentResourceName()}:quick-start`, true);
          },
          once: true,
        });
      }
    );

    onNet(`${GetCurrentResourceName()}:job-assigned`, () => {
      waitUntilThenDo(
        () => this.getPlayerInfo('job') === 'carrier',
        () => {
          this.updateUIData();
        }
      );
    });
  }

  public onForceShowUI(): void {
    this.showCarrierMenu();
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData() {
    const isACarrier: boolean = this.getPlayerInfo('job') === 'carrier';
    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        title: 'Carrier Job',
        description:
          "Carriers deliver local cargo to stores and other businesses. Businesses rely on Carriers' cargo in order to keep running.",
        resource: 'carrier-job',
        buttons: [
          {
            title: 'Quick start',
            subtitle: 'Start a quick, random delivery route',
            icon: 'play_arrow',
            disabled: !isACarrier,
            tooltip: !isACarrier ? 'You are not a carrier' : '',
          },
          {
            title: !isACarrier ? 'Get employed' : 'Already a carrier',
            subtitle: !isACarrier
              ? 'Become a carrier'
              : 'You are already a carrier',
            icon: 'badge',
            unlocked: isACarrier,
          },
        ] as UIButton[],
      })
    );
  }

  private finishDelivery(): void {
    emitNet(`${GetCurrentResourceName()}:route-finished`);
  }
}
