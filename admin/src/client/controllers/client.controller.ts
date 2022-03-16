import { ClientController } from '../../../../[utils]/client/client.controller';
import { Delay } from '../../../../[utils]/utils';

export class Client extends ClientController {
  public constructor() {
    super();

    this.assignCommands();
  }

  private assignCommands(): void {
    // TODO: REMOVE FOLLOWING !!!
    setTick(async () => {
      NetworkOverrideClockTime(12, 0, 0);
      await Delay(10000);
    });
    
  }

  private drawNearbyObjects(): void {
    let [handle, entity] = FindFirstObject(0);

    let found = true;
    while (found) {
      let [f, entity] = FindNextObject(handle);
      found = f;

      let coords = GetEntityCoords(entity, true);
      this.draw(coords[0], coords[1], coords[2], GetEntityModel(entity));
    }

    EndFindObject(handle);
  }

  private draw(x, y, z, text): void {
    let [visible, x1, y1] = GetScreenCoordFromWorldCoord(x, y, z);

    if (visible) {
      SetTextScale(0.5, 0.5);
      SetTextFont(0);
      SetTextProportional(true);
      SetTextColour(255, 255, 255, 255);
      SetTextDropshadow(0, 0, 0, 0, 255);
      SetTextEdge(2, 0, 0, 0, 150);
      SetTextDropShadow();
      SetTextOutline();
      SetTextEntry('STRING');
      SetTextCentre(true);
      AddTextComponentString(text);
      DrawText(x1, y1);
    }
  }
}
