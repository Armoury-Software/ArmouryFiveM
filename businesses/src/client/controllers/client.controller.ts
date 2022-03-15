import { Business } from '../../shared/models/business.interface';
import { UIButton } from '../../../../[utils]/models/ui-button.model';
import { numberWithCommas } from '../../../../[utils]/utils';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { ActionPoint } from '../../../../[utils]/models/action-point.model';

export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.assignListeners();
    this.addUIListener('buttonclick');
    this.addUIListener('dialogbuttonclick');
  }

  public onForceShowUI(data: Business): void {
    super.onForceShowUI(data);
    this.updateUIData(data);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData(business: Business): void {
    const isOwnedByMe: boolean = business.owner === this.getPlayerInfo('name');
    const isUnowned: boolean = !business.owner;
    const businessPrice: number = !isUnowned
      ? business.sellingPrice
      : business.firstPurchasePrice;

    let title: string = '';
    if (isUnowned) {
      title = `Business for Sale! (Price: $${numberWithCommas(
        business.firstPurchasePrice
      )}) (#${business.id})`;
    } else {
      title = `${business.owner}'s ${business.name} (#${business.id})${
        business.sellingPrice ? ' - For sale!' : ''
      }`;
    }

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        title,
        // TODO: Add specific description for every business type
        description:
          "Businesses grant you passive income, even when you're offline. Business income can also be shared with players, by making them partners.",
        resource: GetCurrentResourceName(),
        buttons: [
          {
            title: 'Purchase',
            subtitle: `Purchase this business for $${numberWithCommas(
              businessPrice
            )}.`,
            icon: 'attach_money',
            ...(isUnowned || business.sellingPrice > 0
              ? Number(this.getPlayerInfo('cash')) < businessPrice
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
                    subtitle: `Rent a room in the house${house.rentPrice > 0 ? ' for $' + numberWithCommas(house.rentPrice) : ''}.`,
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

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'buttonclick') {
      const data: { buttonId: number } = eventData;

      switch (data.buttonId) {
        case 0: {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-purchase-business`
          );
          break;
        }
      }
    }

    if (eventName === 'dialogbuttonclick') {
      const data: { buttonId: number; dialogId: string } = eventData;

      switch (data.dialogId) {
        case 'purchase_unowned_business': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-purchase-business`,
            GetPlayerServerId(PlayerId())
          );
          break;
        }
      }
    }
  }

  private assignListeners(): void {
    onNet(
      `${GetCurrentResourceName()}:db-send-entities`,
      (businesses: Business[]) => {
        this.clearMarkers();
        this.clearBlips();
        this.clearActionPoints();

        businesses.forEach((business: Business) => {
          const isOwnedByMe: boolean =
            business.owner === this.getPlayerInfo('name');
          const amIPartner: boolean = business.partnerIds.includes(
            Number(this.getPlayerInfo('id'))
          );
          const businessPrice: number = !business.owner
            ? business.firstPurchasePrice
            : business.sellingPrice > 0
            ? business.sellingPrice
            : 0;
          const isUnowned: boolean = !business.owner;

          this.createMarkers([
            {
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
            },
          ]);

          this.createBlips([
            {
              id: isUnowned ? 375 : 374,
              color: !isOwnedByMe ? (isUnowned ? 69 : 59) : 57,
              title: !isOwnedByMe
                ? `Business - ${business.name} - ${
                    !isUnowned ? 'Owned' : 'Unbought'
                  }`
                : `Business - ${business.name} - Yours`,
              pos: [business.entranceX, business.entranceY, business.entranceZ],
            },
          ]);

          this.createActionPoints({
            pos: [business.entranceX, business.entranceY, business.entranceZ],
            action: () => {
              DisableControlAction(0, 38, true);
              DisableControlAction(0, 68, true);
              DisableControlAction(0, 86, true);
              DisableControlAction(0, 29, true);

              BeginTextCommandDisplayHelp('STRING');
              AddTextComponentSubstringPlayerName(
                `Press ~INPUT_PICKUP~ to ${
                  isOwnedByMe || amIPartner
                    ? 'enter the business.'
                    : 'interact.'
                }${
                  businessPrice > 0
                    ? `~n~Press ~INPUT_SPECIAL_ABILITY_SECONDARY~ to buy for $${numberWithCommas(
                        businessPrice
                      )}.`
                    : ''
                }`
              );
              EndTextCommandDisplayHelp(0, false, true, 1);

              if (IsDisabledControlJustPressed(0, 38)) {
                // TODO: Currently, server-sidedly when /enterbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
                ExecuteCommand('enterbusiness');
              }

              if (IsDisabledControlJustPressed(0, 29)) {
                ExecuteCommand('enterbusiness');
              }
            },
          });

          if (
            !this.actionPoints.find((actionPoint: ActionPoint) => {
              actionPoint.pos[0] === business.exitX &&
                actionPoint.pos[1] === business.exitY &&
                actionPoint.pos[2] === business.exitZ;
            })
          ) {
            this.createActionPoints({
              pos: [business.exitX, business.exitY, business.exitZ],
              action: () => {
                DisableControlAction(0, 38, true);
                DisableControlAction(0, 68, true);
                DisableControlAction(0, 86, true);
                DisableControlAction(0, 244, true);

                BeginTextCommandDisplayHelp('STRING');
                AddTextComponentSubstringPlayerName(
                  'Press ~INPUT_PICKUP~ to exit the business.~n~Press ~INPUT_INTERACTION_MENU~ to open up the menu.'
                );
                EndTextCommandDisplayHelp(0, false, true, 1);

                if (IsDisabledControlJustPressed(0, 38)) {
                  // TODO: Currently, server-sidedly when /exitbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
                  ExecuteCommand('exitbusiness');
                }

                if (IsDisabledControlJustPressed(0, 244)) {
                  ExecuteCommand('businessmenu');
                }
              },
            });
          }
        });
      }
    );

    onNet(`${GetCurrentResourceName()}:show-dialog`, (data: any) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'opendialog',
          dialogdata: JSON.stringify(data),
        })
      );
    });

    onNet(`${GetCurrentResourceName()}:business-purchased`, () => {
      this.hideUI();
      // TODO: Add stuff here
    });

    onNet(`${GetCurrentResourceName()}:business-became-partner`, () => {
      // this.hideUI();
      // TODO: Add stuff here
    });
  }
}
