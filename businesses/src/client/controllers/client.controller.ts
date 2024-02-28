import { Inject } from 'injection-js';
import {
  ClientActionPointsService,
  ClientBlipsService,
  ClientMarkersService,
  ClientSessionService,
  ClientUIService,
  Controller,
  EventListener,
  StringFormatter,
  Command,
  UIButton,
  UIListener,
} from '@armoury/fivem-framework';
import { Business } from '@shared/models/business.interface';

@Controller()
export class Client {
  public constructor(
    @Inject(ClientSessionService) private readonly _session: ClientSessionService,
    @Inject(ClientMarkersService) private readonly _markers: ClientMarkersService,
    @Inject(ClientBlipsService) private readonly _blips: ClientBlipsService,
    @Inject(ClientActionPointsService) private readonly _actionPoints: ClientActionPointsService,
    @Inject(ClientUIService) private readonly _ui: ClientUIService
  ) {
    this._ui.onShow$.subscribe(this.onUIShow.bind(this));
  }

  private onUIShow(business: Business) {
    const isOwnedByMe: boolean = business.owner === this._session.getPlayerInfo('name');
    const isUnowned: boolean = !business.owner;
    const businessPrice: number = !isUnowned ? business.sellingPrice : business.firstPurchasePrice;

    let title: string = '';
    if (isUnowned) {
      title = `Business for Sale! (Price: $${StringFormatter.numberWithCommas(business.firstPurchasePrice)}) (#${
        business.id
      })`;
    } else {
      title = `${business.owner}'s ${business.name} (#${business.id})${business.sellingPrice ? ' - For sale!' : ''}`;
    }

    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'update',
        title,
        // TODO: Add specific description for every business type
        description:
          "Businesses grant you passive income, even when you're offline. Business income can also be shared with players, by making them partners.",
        resource: Cfx.Client.GetCurrentResourceName(),
        buttons: [
          {
            title: 'Purchase',
            subtitle: `Purchase this business for $${StringFormatter.numberWithCommas(businessPrice)}.`,
            icon: 'attach_money',
            ...(isUnowned || business.sellingPrice > 0
              ? Number(this._session.getPlayerInfo('cash')) < businessPrice
                ? {
                    disabled: true,
                    tooltip: 'You do not have enough money',
                  }
                : {
                    disabled: false,
                  }
              : {
                  disabled: true,
                  tooltip: 'Not for sale',
                }),
          },
          /*{
              title: 'Rent',
              subtitle: `Rent a room in the house${house.rentPrice > 0 ? ' for $' + StringFormatter.numberWithCommas(house.rentPrice) : ''}.`,
              icon: 'bed',
              ...isUnowned ? {
                  disabled: true,
                  tooltip: 'House is not owned by anybody'
              } :
                  (!house.rentPrice ? {
                      disabled: true,
                      tooltip: 'Doesn\'t accept tenants'
                  } : (
                      Number(this.getPlayerInfo('cash')) > house.rentPrice ? {
                          disabled: false
                      } : {
                          disabled: true,
                          tooltip: 'Not enough money for rent'
                      }
                  )
              )
          },*/
          {
            title: 'Break in',
            subtitle: 'Attempt to break the lock',
            icon: 'door_back',
            disabled: true,
            tooltip: 'Lockpicking skill too low',
          },
        ] as UIButton[],
      })
    );
  }

  @UIListener({ eventName: 'buttonclick' })
  public onButtonClick({ buttonId }: { buttonId: number }): void {
    switch (buttonId) {
      case 0: {
        Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:request-purchase-business`);
        break;
      }
    }
  }

  @UIListener({ eventName: 'dialogbuttonclick' })
  public onDialogButtonClick({ dialogId }: { dialogId: string }): void {
    switch (dialogId) {
      case 'purchase_unowned_business': {
        Cfx.TriggerServerEvent(`${Cfx.Client.GetCurrentResourceName()}:confirm-purchase-business`);
        break;
      }
    }
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:db-send-entities` })
  public onLoad(businesses: Business[]) {
    this._markers.clearAll();
    this._blips.clearAll();
    this._actionPoints.removeAll();

    businesses.forEach((business: Business) => {
      const isOwnedByMe: boolean = business.owner === this._session.getPlayerInfo('name');
      const amIPartner: boolean = business.partnerIds.includes(Number(this._session.getPlayerInfo('id')));
      const businessPrice: number = !business.owner
        ? business.firstPurchasePrice
        : business.sellingPrice > 0
        ? business.sellingPrice
        : 0;
      const isUnowned: boolean = !business.owner;

      this._markers.create({
        marker: 29,
        pos: [business.entranceX, business.entranceY, business.entranceZ],
        rgba: !isOwnedByMe ? [144, 226, 167, 255] : [93, 182, 229, 255],
        renderDistance: 35.0,
        scale: 1.2,
        rotation: [0.0, 0.0, 0.0],
        underlyingCircle: {
          marker: 25,
          scale: 1.75,
          rgba: !isOwnedByMe ? [144, 226, 167, 255] : [93, 182, 229, 255],
        },
      });

      this._blips.create({
        id: isUnowned ? 375 : 374,
        color: !isOwnedByMe ? (isUnowned ? 69 : 59) : 57,
        title: !isOwnedByMe
          ? `Business - ${business.name} - ${!isUnowned ? 'Owned' : 'Unbought'}`
          : `Business - ${business.name} - Yours`,
        pos: [business.entranceX, business.entranceY, business.entranceZ],
      });

      this._actionPoints.create({
        pos: [business.entranceX, business.entranceY, business.entranceZ],
        action: () => {
          Cfx.Client.DisableControlAction(0, 38, true);
          Cfx.Client.DisableControlAction(0, 68, true);
          Cfx.Client.DisableControlAction(0, 86, true);
          Cfx.Client.DisableControlAction(0, 29, true);

          Cfx.Client.BeginTextCommandDisplayHelp('STRING');
          Cfx.Client.AddTextComponentSubstringPlayerName(
            `Press ~INPUT_PICKUP~ to ${isOwnedByMe || amIPartner ? 'enter the business.' : 'interact.'}${
              businessPrice > 0
                ? `~n~Press ~INPUT_SPECIAL_ABILITY_SECONDARY~ to buy for $${StringFormatter.numberWithCommas(
                    businessPrice
                  )}.`
                : ''
            }`
          );
          Cfx.Client.EndTextCommandDisplayHelp(0, false, true, 1);

          if (Cfx.Client.IsDisabledControlJustPressed(0, 38)) {
            // TODO: Currently, server-sidedly when /enterbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
            Cfx.Client.ExecuteCommand('enterbusiness');
          }

          if (Cfx.Client.IsDisabledControlJustPressed(0, 29)) {
            Cfx.Client.ExecuteCommand('enterbusiness');
          }
        },
      });

      if (!this._actionPoints.existsAtPosition(business.exitX, business.exitY, business.exitZ)) {
        this._actionPoints.create({
          pos: [business.exitX, business.exitY, business.exitZ],
          action: () => {
            Cfx.Client.DisableControlAction(0, 38, true);
            Cfx.Client.DisableControlAction(0, 68, true);
            Cfx.Client.DisableControlAction(0, 86, true);
            Cfx.Client.DisableControlAction(0, 244, true);

            Cfx.Client.BeginTextCommandDisplayHelp('STRING');
            Cfx.Client.AddTextComponentSubstringPlayerName(
              'Press ~INPUT_PICKUP~ to exit the business.~n~Press ~INPUT_INTERACTION_MENU~ to open up the menu.'
            );
            Cfx.Client.EndTextCommandDisplayHelp(0, false, true, 1);

            if (Cfx.Client.IsDisabledControlJustPressed(0, 38)) {
              // TODO: Currently, server-sidedly when /exitbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
              Cfx.Client.ExecuteCommand('exitbusiness');
            }

            if (Cfx.Client.IsDisabledControlJustPressed(0, 244)) {
              Cfx.Client.ExecuteCommand('businessmenu');
            }
          },
        });
      }
    });
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:show-dialog` })
  public onShowDialog(data: any) {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'opendialog',
        dialogdata: JSON.stringify(data),
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:business-purchased` })
  public onPurchase() {
    this._ui.hide();
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:business-became-partner` })
  public onBecamePartner() {
    // this._ui.hide();
    // TODO: Add stuff here
  }
}
