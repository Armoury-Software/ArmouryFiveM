import {
  TRUCKER_MARKERS,
  TRUCKER_QUICKSTART_POSITIONS,
  TRUCKER_DELIVERY_TRAILERS,
} from '../../shared/positions';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { UIButton } from '../../../../[utils]/models/ui-button.model';
import { waitUntilThenDo } from '../../../../[utils]/utils';
import {
  TRUCKER_DELIVERY_TYPE,
  TRUCKER_PAGES,
} from '../../shared/models/delivery-point.model';

export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.createBlips([
      {
        ...TRUCKER_MARKERS.getJobMarker.blip,
        pos: TRUCKER_MARKERS.getJobMarker.pos,
      },
    ]);

    this.createMarkers([TRUCKER_MARKERS.getJobMarker]);

    this.createActionPoints({
      pos: TRUCKER_MARKERS.getJobMarker.pos,
      action: () => {
        if (!this.isUIShowing() && !this.isUIOnCooldown()) {
          this.showTruckerMenu();
        }
      },
    });

    this.addControllerListeners();
    this.addUIListener('buttonclick');
  }

  private currentPage: TRUCKER_PAGES = TRUCKER_PAGES.MAIN;

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'buttonclick') {
      const data: { buttonId: number } = eventData;
      switch (this.currentPage) {
        case TRUCKER_PAGES.MAIN: {
          switch (data.buttonId) {
            case 0: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'OIL'
              );
              this.hideUI();
              break;
            }
            case 1: {
              this.currentPage = TRUCKER_PAGES.LEGAL;
              this.updateUIData([
                {
                  title: 'OIL',
                  subtitle: 'Start a quick, random delivery route',
                  icon: 'science',
                },
                {
                  title: 'ELECTRICITY',
                  subtitle: 'Select a legal truck delivery',
                  icon: 'science',
                  disabled: this.getPlayerInfo('skills')['trucker'] < 3,
                },
              ]);
              break;
            }
            case 2: {
              this.currentPage = TRUCKER_PAGES.ILLEGAL;
              this.updateUIData([
                {
                  title: 'CARGO 1',
                  subtitle: 'Start a quick, random delivery route',
                  icon: 'science',
                  disabled: this.getPlayerInfo('skills')['trucker'] < 2,
                },
                {
                  title: 'CARGO 2',
                  subtitle: 'Select a legal truck delivery',
                  icon: 'science',
                  disabled: this.getPlayerInfo('skills')['trucker'] < 3,
                },
                {
                  title: 'CARGO 3',
                  subtitle: 'Select an illegal truck delivery',
                  icon: 'science',
                  disabled: this.getPlayerInfo('skills')['trucker'] < 4,
                },
                {
                  title: 'CARGO 4',
                  subtitle: 'Select an illegal truck delivery',
                  icon: 'science',
                  disabled: this.getPlayerInfo('skills')['trucker'] < 5,
                },
              ]);

              break;
            }
            case 3: {
              TriggerServerEvent(`${GetCurrentResourceName()}:get-job`);
              break;
            }
          }
          break;
        }
        case TRUCKER_PAGES.LEGAL: {
          switch (data.buttonId) {
            case 0: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'OIL'
              );
              this.hideUI();
              break;
            }
            case 1: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'ELECTRICITY'
              );
              this.hideUI();
              break;
            }
          }
          break;
        }
        case TRUCKER_PAGES.ILLEGAL: {
          switch (data.buttonId) {
            case 0: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'CARGO 1'
              );
              this.hideUI();
              break;
            }
            case 1: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'CARGO 2'
              );
              this.hideUI();
              break;
            }
            case 2: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'CARGO 3'
              );
              this.hideUI();
              break;
            }
            case 3: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:quick-start`,
                'CARGO 4'
              );
              this.hideUI();
              break;
            }
          }
        }
      }
    }
  }

  private showTruckerMenu(): void {
    this.currentPage = TRUCKER_PAGES.MAIN;
    this.updateUIData(this.getDefaultUIButtons());
    this.showUI();
  }

  private addControllerListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:begin-job`,
      async (
        deliveryPosition: { X: number; Y: number; Z: number },
        type: string
      ) => {
        const deliveryPoint: number = this.createWaypoint(
          [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          'Job - Trucker - Delivery Point',
          69,
          652
        );

        this.createActionPoints({
          pos: [deliveryPosition.X, deliveryPosition.Y, deliveryPosition.Z],
          action: () => {
            this.finishDelivery();
            this.clearWaypoint(deliveryPoint);
          },
          once: true,
        });

        let _spawnedTruck: number;
        if (!IsPedInAnyVehicle(GetPlayerPed(-1), false)) {
          _spawnedTruck = await this.createVehicleAsync(
            1518533038,
            TRUCKER_QUICKSTART_POSITIONS[0].pos[0],
            TRUCKER_QUICKSTART_POSITIONS[0].pos[1],
            TRUCKER_QUICKSTART_POSITIONS[0].pos[2],
            0.0,
            true,
            true
          );
          TaskWarpPedIntoVehicle(GetPlayerPed(-1), _spawnedTruck, -1);
        } else {
          _spawnedTruck = GetVehiclePedIsIn(GetPlayerPed(-1), false);
        }
        const trailerToSpawnArray = TRUCKER_DELIVERY_TRAILERS.get(
          this.decideTrailerType(type)
        );
        const trailerToSpawn: number =
          trailerToSpawnArray[
            Math.floor(Math.random() * trailerToSpawnArray.length)
          ];
        const trailerOffsets: number[] = GetOffsetFromEntityInWorldCoords(
          _spawnedTruck,
          0.0,
          8.0,
          0.0
        );
        const spawnedTrailer: number = await this.createVehicleAsync(
          trailerToSpawn,
          trailerOffsets[0],
          trailerOffsets[1],
          trailerOffsets[2],
          0,
          true,
          true
        );
        AttachVehicleToTrailer(_spawnedTruck, spawnedTrailer, 100.0);
      }
    );

    onNet(`${GetCurrentResourceName()}:job-assigned`, () => {
      waitUntilThenDo(
        () => this.getPlayerInfo('job') === 'trucker',
        () => {
          this.currentPage = TRUCKER_PAGES.MAIN;
          this.updateUIData(this.getDefaultUIButtons());
        }
      );
    });
  }

  public onForceShowUI(): void {
    this.showTruckerMenu();
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData(buttons: UIButton[]): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        title: 'Trucker Job',
        description:
          'Truckers deliver international cargo for usage in stores and other local businesses. They also help decentralize traffic outside the main area of influence.',
        resource: 'trucker-job',
        buttons,
      })
    );
  }

  private decideTrailerType(type: string): number {
    switch (type) {
      case 'OIL':
        return 0;
      case 'ELECTRICITY':
        return 1;
      default:
        return 2;
    }
  }

  private getDefaultUIButtons(): UIButton[] {
    const isATrucker: boolean = this.getPlayerInfo('job') === 'trucker';
    const skillLevel: number = this.getPlayerInfo('skills')['trucker'];
    skillLevel ? skillLevel : 0;
    return [
      {
        title: 'Quick start',
        subtitle: 'Start a quick, random delivery route',
        icon: 'play_arrow',
        disabled: !isATrucker,
        tooltip: !isATrucker ? 'You are not a trucker' : '',
      },
      {
        title: 'Legal delivery',
        subtitle: 'Select a legal truck delivery',
        icon: 'local_shipping',
        disabled: !isATrucker,
        tooltip: !isATrucker ? 'You are not a trucker' : '',
      },
      {
        title: 'Illegal delivery',
        subtitle: 'Select an illegal truck delivery',
        icon: 'science',
        disabled: !isATrucker || skillLevel < 2, // TODO: Also disable if the player doesn't have trucker skill level 5
        tooltip: !isATrucker ? 'You are not a trucker' : '', // TODO: Add possible error for skill level < 5
      },
      {
        title: !isATrucker ? 'Get employed' : 'Already a trucker',
        subtitle: !isATrucker
          ? 'Become a trucker'
          : 'You are already a trucker',
        icon: 'badge',
        unlocked: isATrucker,
      },
    ] as UIButton[];
  }

  private finishDelivery(): void {
    emitNet(`${GetCurrentResourceName()}:job-finished`);
    DeleteEntity(
      GetVehicleTrailerVehicle(GetVehiclePedIsUsing(GetPlayerPed(-1)))[1]
    );
  }
}
