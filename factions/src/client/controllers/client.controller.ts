import { ClientWithUIController } from '@core/client/client-ui.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';
import { ActionPoint } from '@core/models/action-point.model';

import { Faction } from '@shared/models/faction.interface';
import { FactionData } from '@shared/models/faction-data.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientWithUIController {
  public constructor() {
    super();

    this.assignListeners();
    this.addUIListener('buttonclick');
    this.addUIListener('statbuttonclick');
    this.addUIListener('dialogbuttonclick');
    this.addUIListener('dialogstatsbuttonclick');
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
        firstSectionTitle: this.translate('faction_members_list'),
        secondSectionTitle: this.translate('news'),
        slots: Array(15).fill(0),
        stats: JSON.stringify(faction.stats),
        items: JSON.stringify(faction.items),
        menuCategory: this.translate('members'),
        title: faction.title,
        leftMenu: JSON.stringify(faction.leftMenu),
        rightMenu: JSON.stringify(faction.rightMenu),
        isWide: faction.isWide,
        news: faction.news ? JSON.stringify(faction.news) : [],
        bottomSide: faction.bottomSide ?? '',
      })
    );
  }

  protected onIncomingUIMessage(eventName: string, eventData: any): void {
    super.onIncomingUIMessage(eventName, eventData);

    if (eventName === 'buttonclick') {
      const data: { buttonId: number; menu: number } = eventData;

      switch (data.menu) {
        case 0: {
          switch (data.buttonId) {
            case 2: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:request-call-tow`
              );
              break;
            }
          }
          break;
        }
        case 1: {
          // right menu
          switch (data.buttonId) {
            case 0: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:request-manage-privileges`
              );
              break;
            }
            case 1: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:request-manage-sanctions`
              );
              break;
            }
            case 2: {
              TriggerServerEvent(
                `${GetCurrentResourceName()}:request-manage-activity`
              );
              break;
            }
          }

          break;
        }
      }
    }

    if (eventName === 'dialogbuttonclick') {
      const data: { buttonId: number; dialogId: string } = eventData;

      switch (data.dialogId) {
        case 'faction-confirm-manage-member-rank': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-increment-rank`
          );
          break;
        }
        case 'faction-confirm-warn-member': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-warn-faction-member`
          );
          break;
        }
        case 'faction-confirm-kick-member': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-kick-faction-member`
          );
          break;
        }
        case 'faction-confirm-manage-member-tester-status': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:confirm-modify-tester-status`
          );
          break;
        }
        case 'faction-confirm-call-tow': {
          TriggerServerEvent(`${GetCurrentResourceName()}:confirm-call-tow`);
          break;
        }
      }
    }

    if (eventName === 'dialogstatsbuttonclick') {
      const button: { buttonId: string } = eventData;

      switch (button.buttonId.split('_').slice(0, 2).join('_')) {
        case 'rank_up': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-increment-rank`,
            Number(button.buttonId.split('_')[2]),
            Number(button.buttonId.split('_')[3]),
            1
          );
          break;
        }
        case 'rank_down': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-increment-rank`,
            Number(button.buttonId.split('_')[2]),
            Number(button.buttonId.split('_')[3]),
            -1
          );
          break;
        }
        case 'make_tester': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-modify-tester-status`,
            Number(button.buttonId.split('_')[2]),
            Number(button.buttonId.split('_')[3]),
            -1
          );
          break;
        }
        case 'sanction_up': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-warn-faction-member`,
            Number(button.buttonId.split('_')[2]),
            1,
            true
          );
          break;
        }
        case 'sanction_down': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-warn-faction-member`,
            Number(button.buttonId.split('_')[2]),
            -1,
            true
          );
          break;
        }
      }
    }

    if (eventName === 'statbuttonclick') {
      const button: { buttonId: string } = eventData;

      switch (button.buttonId.split('_').slice(0, -1).join('_')) {
        case 'faction_menu_edit': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-manage-privileges`
          );
          break;
        }
        case 'faction_menu_warn': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-warn-faction-member`,
            Number(button.buttonId.split('_').slice(-1)[0]),
            1
          );
          break;
        }
        case 'faction_menu_kick': {
          TriggerServerEvent(
            `${GetCurrentResourceName()}:request-kick-faction-member`,
            Number(button.buttonId.split('_').slice(-1)[0])
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
          if (faction.blipId > 0) {
            this.createBlips([
              {
                id: faction.blipId,
                color: 57,
                title: this.translate('blip_title_faction', {
                  name: faction.name,
                }),
                pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
              },
            ]);
          }

          if (faction.exitX && faction.exitY && faction.exitZ) {
            this.createMarkers([
              {
                marker: 0,
                pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
                rgba: [255, 255, 255, 255],
                renderDistance: 35.0,
                scale: 0.75,
                rotation: [0.0, 0.0, 0.0],
                underlyingCircle: {
                  marker: 25,
                  scale: 1.75,
                  rgba: [255, 255, 255, 255],
                },
              },
            ]);

            this.createActionPoints({
              pos: [faction.entranceX, faction.entranceY, faction.entranceZ],
              action: () => {
                DisableControlAction(0, 38, true);
                DisableControlAction(0, 68, true);
                DisableControlAction(0, 86, true);
                DisableControlAction(0, 29, true);

                BeginTextCommandDisplayHelp('STRING');
                AddTextComponentSubstringPlayerName(
                  this.translate('tooltip_enter_faction_hq')
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
              !this.actionPointExistsAtPosition(
                faction.exitX,
                faction.exitY,
                faction.exitZ
              )
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
                    this.translate('tooltip_exit_faction_hq')
                  );
                  EndTextCommandDisplayHelp(0, false, true, 1);

                  if (IsDisabledControlJustPressed(0, 38)) {
                    // TODO: Currently, server-sidedly when /exitbusiness is used the server is looping through every business. Instead, add metadata functionality to actionPoints and send the business ID (grabbed from metadata) to the server here in the command.
                    ExecuteCommand('exitfaction');
                  }
                },
              });
            }
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

    onNet(`${GetCurrentResourceName()}:update-dialog`, (data: any) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'updatedialog',
          dialogdata: JSON.stringify(data),
        })
      );
    });

    onNet(`${GetCurrentResourceName()}:close-dialog`, (dialogId: string) => {
      SendNuiMessage(
        JSON.stringify({
          type: 'closedialog',
          dialogId,
        })
      );
    });
  }
}
