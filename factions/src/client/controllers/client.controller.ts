import { Faction } from '../../shared/models/faction.interface';
import { ClientWithUIController } from '../../../../[utils]/client/client-ui.controller';
import { ActionPoint } from '../../../../[utils]/models/action-point.model';
import { FactionData } from '../../shared/models/faction-data.interface';

export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.assignListeners();
    this.addUIListener('buttonclick');
    this.addUIListener('dialogbuttonclick');
  }

  public onForceShowUI(data: FactionData): void {
    super.onForceShowUI(data);
    this.updateUIData(data);
  }

  public onForceHideUI(): void {
    super.onForceHideUI();
  }

  private updateUIData(faction: FactionData): void {
    SendNuiMessage(
      JSON.stringify({
        type: 'update',
        resource: faction.resource,
        firstSectionTitle: 'Faction Information',
        secondSectionTitle: 'Members',
        slots: Array(15).fill(0),
        stats: JSON.stringify(faction.stats),
        items: JSON.stringify(faction.items),
        menuCategory: 'tenants',
        title: faction.title,
        leftMenu: JSON.stringify(faction.leftMenu),
        rightMenu: JSON.stringify(faction.rightMenu),
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
      (factions: Faction[]) => {
        this.clearMarkers();
        this.clearBlips();
        this.clearActionPoints();

        factions.forEach((faction: Faction) => {
          this.createMarkers([
            {
              marker: 29,
              pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
              rgba: [144, 226, 167, 255],
              renderDistance: 35.0,
              scale: 1.2,
              rotation: [0.0, 0.0, 0.0],
              underlyingCircle: {
                marker: 25,
                scale: 1.75,
                rgba: [93, 182, 229, 255],
              },
            },
          ]);

          if (faction.blipId > 0) {
            this.createBlips([
              {
                id: faction.blipId,
                color: 57,
                title: `Faction - ${faction.name}`,
                pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
              },
            ]);
          }

          this.createActionPoints({
            pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
            action: () => {
              DisableControlAction(0, 38, true);
              DisableControlAction(0, 68, true);
              DisableControlAction(0, 86, true);
              DisableControlAction(0, 29, true);

              BeginTextCommandDisplayHelp('STRING');
              AddTextComponentSubstringPlayerName(
                `Press ~INPUT_PICKUP~ to enter the faction HQ.`
              );
              EndTextCommandDisplayHelp(0, false, true, 1);

              if (IsDisabledControlJustPressed(0, 38)) {
                // TODO: Currently, server-sidedly when /enterfaction is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
                ExecuteCommand('enterfaction');
              }

              if (IsDisabledControlJustPressed(0, 29)) {
                ExecuteCommand('enterfaction');
              }
            },
          });

          if (
            !this.actionPoints.find((actionPoint: ActionPoint) => {
              actionPoint.pos[0] === faction.exitX &&
                actionPoint.pos[1] === faction.exitY &&
                actionPoint.pos[2] === faction.exitZ;
            })
          ) {
            this.createActionPoints({
              pos: [faction.exitX, faction.exitY, faction.exitZ],
              action: () => {
                DisableControlAction(0, 38, true);
                DisableControlAction(0, 68, true);
                DisableControlAction(0, 86, true);
                DisableControlAction(0, 244, true);

                BeginTextCommandDisplayHelp('STRING');
                AddTextComponentSubstringPlayerName(
                  'Press ~INPUT_PICKUP~ to exit the faction HQ.~n~Press ~INPUT_INTERACTION_MENU~ to open up the menu.'
                );
                EndTextCommandDisplayHelp(0, false, true, 1);

                if (IsDisabledControlJustPressed(0, 38)) {
                  // TODO: Currently, server-sidedly when /exitbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
                  ExecuteCommand('exitfaction');
                }

                if (IsDisabledControlJustPressed(0, 244)) {
                  ExecuteCommand('factionmenu');
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
