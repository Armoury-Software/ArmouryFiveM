import { ClientWithUIController } from '@core/client/client-ui.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

@FiveMController()
export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.addUIListener('buttonclick');
    this.addUIListener('dialogbuttonclick');
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:show-dialog`,
  })
  public onShouldShowDialog(data: any): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'opendialog',
        resource: GetCurrentResourceName(),
        dialogdata: JSON.stringify(data),
      })
    );
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
        firstSectionTitle: 'House Information',
        secondSectionTitle: 'Tenants',
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

  protected override onIncomingUIMessage(
    eventName: string,
    eventData: any
  ): void {
    super.onIncomingUIMessage(eventName, eventData);

    switch (eventName) {
      case 'buttonclick': {
        if (eventData.menu === 0) {
          // Left side menu
          switch (eventData.buttonId) {
            case 0: {
              TriggerServerEvent('houses:request-set-for-sale');
              break;
            }
            case 1: {
              TriggerServerEvent('houses:request-sell-to-bank');
              break;
            }
            case 2: {
              TriggerServerEvent('houses:request-rent-options');
              break;
            }
            case 3: {
              TriggerServerEvent('houses:request-evict-tenants');
              break;
            }
          }
        }
        break;
      }
      case 'dialogbuttonclick': {
        switch (eventData.dialogId) {
          case 'set-house-for-sale': {
            const sellPrice: number = eventData.form.housesellprice;
            TriggerServerEvent('houses:confirm-set-for-sale', sellPrice);
            break;
          }
          case 'sell-house-to-bank': {
            TriggerServerEvent('houses:confirm-sell-to-bank');
            break;
          }
          case 'adjust-rent-price': {
            const rentPrice: number = eventData.form.houserentprice;
            TriggerServerEvent('houses:confirm-adjust-rent', rentPrice);
            break;
          }
          case 'evict-all-tenants': {
            TriggerServerEvent('houses:confirm-evict-tenants');
            break;
          }
        }
        break;
      }
    }
  }
}
