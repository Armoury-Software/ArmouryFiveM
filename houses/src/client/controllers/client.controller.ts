import { House } from '../../shared/models/house.interface';
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

  public onForceShowUI(data: House): void {
    super.onForceShowUI(data);
    this.updateUIData(data);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData(house: House): void {
    const isOwnedByMe: boolean = house.owner === this.getPlayerInfo('name');
    const isUnowned: boolean = !house.owner;
    const housePrice: number = !isUnowned
      ? house.sellingPrice
      : house.firstPurchasePrice;

    let title: string = '';
    if (isUnowned) {
      title = `House For Sale! (Price: $${numberWithCommas(
        house.firstPurchasePrice
      )}) (#${house.id})`;
    } else {
      title = `${house.owner}'s house (#${house.id})${
        house.sellingPrice ? ' - For sale!' : ''
      }`;
    }

    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        title,
        description:
          'Houses offer you storage, security, a place to sleep, rent opportunities and more. Houses are automatically sold as a result of prolonged inactivity.',
        resource: GetCurrentResourceName(),
        buttons: [
          {
            title: 'Purchase',
            subtitle: `Purchase this house for $${numberWithCommas(
              housePrice
            )}.`,
            icon: 'attach_money',
            ...(isUnowned || house.sellingPrice > 0
              ? Number(this.getPlayerInfo('cash')) < housePrice
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
          {
            title: 'Rent',
            subtitle: `Rent a room in the house${
              house.rentPrice > 0
                ? ' for $' + numberWithCommas(house.rentPrice)
                : ''
            }.`,
            icon: 'bed',
            ...(isUnowned
              ? {
                  disabled: true,
                  tooltip: 'House is not owned by anybody',
                }
              : !house.rentPrice
              ? {
                  disabled: true,
                  tooltip: "Doesn't accept tenants",
                }
              : Number(this.getPlayerInfo('cash')) > house.rentPrice
              ? {
                  disabled: false,
                }
              : {
                  disabled: true,
                  tooltip: 'Not enough money for rent',
                }),
          },
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
            `${GetCurrentResourceName()}:request-purchase-house`
          );
          break;
        }
        case 1: {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-become-tenant`
          );
        }
      }
    }

    if (eventName === 'dialogbuttonclick') {
      const data: { buttonId: number; dialogId: string } = eventData;

      switch (data.dialogId) {
        case 'purchase_unowned_house': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-purchase-house`,
            GetPlayerServerId(PlayerId())
          );
          break;
        }
      }
    }
  }

  private assignListeners(): void {
    onNet(`${GetCurrentResourceName()}:db-send-entities`, (houses: House[]) => {
      console.log(houses);
      this.clearMarkers();
      this.clearBlips();
      this.clearActionPoints();

      houses.forEach((house: House) => {
        const isOwnedByMe: boolean = house.owner === this.getPlayerInfo('name');
        const isUnowned: boolean = !house.owner;

        this.createMarkers([
          {
            marker: 9,
            pos: [house.entranceX, house.entranceY, house.entranceZ],
            rgba: !isOwnedByMe ? [144, 226, 167, 255] : [93, 182, 229, 255],
            renderDistance: 35.0,
            scale: 0.75,
            textureDict: 'houses',
            textureName: 'home_marker',
            rotation: [90.0, 0.0, 0.0],
            underlyingCircle: {
              marker: 25,
              scale: 1.75,
              rgba: !isOwnedByMe ? [144, 226, 167, 255] : [93, 182, 229, 255],
            },
          },
        ]);

        console.log(house.entranceX, typeof house.entranceX);

        this.createBlips([
          {
            id: 40,
            color: !isOwnedByMe ? (isUnowned ? 69 : 59) : 57,
            title: !isOwnedByMe
              ? `House - ${!isUnowned ? 'Owned' : 'Unbought'}`
              : 'House - Your house',
            pos: [house.entranceX, house.entranceY, house.entranceZ],
          },
        ]);

        this.createActionPoints({
          pos: [house.entranceX, house.entranceY, house.entranceZ],
          action: () => {
            DisableControlAction(0, 38, true);
            DisableControlAction(0, 68, true);
            DisableControlAction(0, 86, true);
            DisableControlAction(0, 29, true);

            BeginTextCommandDisplayHelp('STRING');
            AddTextComponentSubstringPlayerName(
              `Press ~INPUT_PICKUP~ to enter the house.${
                house.owner && house.sellingPrice > 0
                  ? `~n~Press ~INPUT_SPECIAL_ABILITY_SECONDARY~ to buy for $${numberWithCommas(
                      house.sellingPrice
                    )}.`
                  : ''
              }`
            );
            EndTextCommandDisplayHelp(0, false, true, 1);

            if (IsDisabledControlJustPressed(0, 38)) {
              // TODO: Currently, server-sidedly when /enterhouse is used the server is looping through every house. Instead, add metadata functionality to actionPoints and send the house ID (grabbed from metadata) to the server here in the command.
              ExecuteCommand('enterhouse');
            }

            if (IsDisabledControlJustPressed(0, 29)) {
              ExecuteCommand('enterhouse');
            }
          },
        });

        if (
          !this.actionPoints.find((actionPoint: ActionPoint) => {
            actionPoint.pos[0] === house.exitX &&
              actionPoint.pos[1] === house.exitY &&
              actionPoint.pos[2] === house.exitZ;
          })
        ) {
          this.createActionPoints({
            pos: [house.exitX, house.exitY, house.exitZ],
            action: () => {
              DisableControlAction(0, 38, true);
              DisableControlAction(0, 68, true);
              DisableControlAction(0, 86, true);
              DisableControlAction(0, 244, true);

              BeginTextCommandDisplayHelp('STRING');
              AddTextComponentSubstringPlayerName(
                'Press ~INPUT_PICKUP~ to exit the house.~n~Press ~INPUT_INTERACTION_MENU~ to open up the house menu.'
              );
              EndTextCommandDisplayHelp(0, false, true, 1);

              if (IsDisabledControlJustPressed(0, 38)) {
                // TODO: Currently, server-sidedly when /exithouse is used the server is looping through every house. Instead, add metadata functionality to actionPoints and send the house ID (grabbed from metadata) to the server here in the command.
                ExecuteCommand('exithouse');
              }

              if (IsDisabledControlJustPressed(0, 244)) {
                ExecuteCommand('housemenu');
              }
            },
          });
        }
      });
    });

    onNet(`${GetCurrentResourceName()}:show-dialog`, (data: any) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'opendialog',
          dialogdata: JSON.stringify(data),
        })
      );
    });

    onNet(`${GetCurrentResourceName()}:house-purchased`, () => {
      this.hideUI();
      // TODO: Add stuff here
    });

    onNet(`${GetCurrentResourceName()}:house-became-tenant`, () => {
      this.hideUI();
      // TODO: Add stuff here
    });
  }
}
