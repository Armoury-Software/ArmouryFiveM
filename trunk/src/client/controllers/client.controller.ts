import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientController {
  @EventListener({ eventName: `${GetCurrentResourceName()}:open-trunk` })
  public onTrunkRequestOpen(vehicleNetworkId: number): void {
    SetCarBootOpen(NetworkGetEntityFromNetworkId(vehicleNetworkId));
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:close-trunk` })
  public onTrunkRequestClose(vehicleNetworkId: number): void {
    SetVehicleDoorShut(
      NetworkGetEntityFromNetworkId(vehicleNetworkId),
      5,
      false
    );
  }
}
