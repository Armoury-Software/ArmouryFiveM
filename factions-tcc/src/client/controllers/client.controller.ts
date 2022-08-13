import { ClientFactionController } from '@core/client/client-faction.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientFactionController {
  private tccWaypoints: { [key: string]: number } = {};

  @EventListener({
    eventName: `${GetCurrentResourceName()}:remove-tow-delivery-checkpoint`,
  })
  public onShouldRemoveTowDeliveryCheckpoint(): void {
    if (this.tccWaypoints['delivery_waypoint']) {
      this.clearWaypoint(this.tccWaypoints['delivery_waypoint']);
      this.clearActionPoint('tcc-delivery-actionpoint');
      delete this.tccWaypoints['delivery_waypoint'];
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:set-tow-delivery-checkpoint`,
  })
  public onShouldSetTowDeliveryCheckpoint(
    originalVehicleX: number,
    originalVehicleY: number,
    originalVehicleZ: number,
    range: number
  ): void {
    this.tccWaypoints['delivery_waypoint'] = this.createWaypoint(
      [originalVehicleX, originalVehicleY, originalVehicleZ],
      this.translate('blip_title_deliver_vehicle'),
      32,
      103,
      undefined,
      range
    );

    this.createActionPoints({
      pos: [originalVehicleX, originalVehicleY, originalVehicleZ],
      action: () => {
        const trailerVehicleEntity: number = GetEntityAttachedToTowTruck(
          GetVehiclePedIsIn(PlayerPedId(), false)
        );
        if (trailerVehicleEntity && DoesEntityExist(trailerVehicleEntity)) {
          this.clearWaypoint(this.tccWaypoints['delivery_waypoint']);
          this.clearActionPoint('tcc-delivery-actionpoint');

          TriggerServerEvent(
            `${GetCurrentResourceName()}:tow-delivery-success`,
            NetworkGetNetworkIdFromEntity(trailerVehicleEntity)
          );
        }
      },
      range,
      id: 'tcc-delivery-actionpoint',
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:remove-tow-call-checkpoint`,
  })
  public onShouldRemoveTowCallCheckpoint(): void {
    if (this.tccWaypoints['call_waypoint']) {
      this.clearWaypoint(this.tccWaypoints['call_waypoint']);
      delete this.tccWaypoints['call_waypoint'];
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:set-tow-call-checkpoint`,
  })
  public onShouldSetTowCallCheckpoint(
    vehicleX: number,
    vehicleY: number,
    vehicleZ: number
  ): void {
    this.tccWaypoints['call_waypoint'] = this.createWaypoint(
      [vehicleX, vehicleY, vehicleZ],
      this.translate('blip_title_pickup_vehicle'),
      32,
      68
    );
  }
}
