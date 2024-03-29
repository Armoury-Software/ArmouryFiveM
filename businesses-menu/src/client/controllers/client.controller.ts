import { ClientWithUIController } from '@core/client/client-ui.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientWithUIController {
  public constructor() {
    super();
    this.addControllerListeners();
  }

  public onForceShowUI(data: any): void {
    super.onForceShowUI(data);
    this.updateUIData(data);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData(data: any): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: GetCurrentResourceName(),
        firstSectionTitle: 'Business Information',
        secondSectionTitle: 'Partners',
        slots: Array(6).fill(0),
        stats: JSON.stringify(data.stats),
        items: JSON.stringify(data.items),
        menuCategory: 'tenants',
        title: data.title,
        leftMenu: JSON.stringify(data.leftMenu),
        rightMenu: JSON.stringify(data.rightMenu),
      })
    );
  }

  private addControllerListeners(): void {
    // Add stuff here
  }
}
