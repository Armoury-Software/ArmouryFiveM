import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerEntityWithEntranceController } from '@core/server/entity-controllers/server-entity-entrance.controller';
import { numberWithCommas } from '@core/utils';
import { Faction, FactionMember } from '@shared/models/faction.interface';

import { Player } from '../../../../authentication/src/shared/models/player.model';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerEntityWithEntranceController<Faction> {
  private onlinePlayersWithFactions: Map<number, string> = new Map();
  private factionsWithOnlinePlayers: Map<string, number[]> = new Map();
  private leadersManagingRanks: Map<
    number,
    { newRank: number; id: number; onlineId?: number }
  > = new Map();
  private leadersSanctioningPlayers: Map<
    number,
    {
      newSanctionsNumber: number;
      id: number;
      onlineId?: number;
      wasPreviouslyInMenu?: boolean;
    }
  > = new Map();
  private leadersManagingTesterStatuses: Map<
    number,
    { newTesterStatus: boolean; id: number; onlineId?: number }
  > = new Map();
  private leadersKickingPlayers: Map<number, number> = new Map();

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-kick-faction-member`,
  })
  public onConfirmKickMember(): void {
    const playerId: number = source;

    if (!this.leadersKickingPlayers.has(playerId)) {
      return;
    }

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember: FactionMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) =>
        factionMember.id === this.leadersKickingPlayers.get(playerId)
    );

    if (!existingMember) {
      return;
    }

    factionPlayerIsLeaderFor.members = factionPlayerIsLeaderFor.members.filter(
      (factionMember) =>
        factionMember.id !== this.leadersKickingPlayers.get(playerId)
    );

    global.exports['factions-logs'].addToFactionLog(
      factionPlayerIsLeaderFor.internalId,
      `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
        'authentication'
      ].getPlayerInfo(playerId, 'name')} l-a dat afara din factiune pe ${
        existingMember.onlineName
      }. (concediere)`
    );

    this.saveDBEntityAsync(factionPlayerIsLeaderFor.id);
    this.leadersKickingPlayers.delete(playerId);
    this.factionMenu(playerId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-kick-faction-member`,
  })
  public onRequestKickMember(playerDBId: number): void {
    if (!playerDBId || !Number(playerDBId)) {
      return;
    }

    const playerId: number = source;
    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, playerId, {
      title: this.translate('title_member_kick'),
      content: this.translate('title_member_kick_confirmation'),
      dialogId: 'faction-confirm-kick-member',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });

    this.leadersKickingPlayers.set(playerId, playerDBId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-warn-faction-member`,
  })
  public onConfirmWarnMember(): void {
    const playerId: number = source;

    if (!this.leadersSanctioningPlayers.has(playerId)) {
      return;
    }

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    let factionMemberToBeKickedOut: FactionMember = null;
    const newSanctionsNumber: number =
      this.leadersSanctioningPlayers.get(playerId).newSanctionsNumber;

    factionPlayerIsLeaderFor.members = [
      ...factionPlayerIsLeaderFor.members.map((factionMember) => {
        if (
          factionMember.id === this.leadersSanctioningPlayers.get(playerId).id
        ) {
          if (newSanctionsNumber >= 3) {
            factionMemberToBeKickedOut = factionMember;
          }

          if (newSanctionsNumber < factionMember.warnings) {
            global.exports['factions-logs'].addToFactionLog(
              factionPlayerIsLeaderFor.internalId,
              `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
                'authentication'
              ].getPlayerInfo(playerId, 'name')} i-a scos o sanctiune lui ${
                factionMember.onlineName
              }. (${newSanctionsNumber}/3)`
            );
          } else if (factionMemberToBeKickedOut === factionMember) {
            global.exports['factions-logs'].addToFactionLog(
              factionPlayerIsLeaderFor.internalId,
              `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
                'authentication'
              ].getPlayerInfo(
                playerId,
                'name'
              )} l-a dat afara din factiune pe ${
                factionMember.onlineName
              }. (${newSanctionsNumber}/3)`
            );
          } else {
            global.exports['factions-logs'].addToFactionLog(
              factionPlayerIsLeaderFor.internalId,
              `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
                'authentication'
              ].getPlayerInfo(playerId, 'name')} i-a adaugat o sanctiune lui ${
                factionMember.onlineName
              }. (${newSanctionsNumber}/3)`
            );
          }

          return {
            ...factionMember,
            warnings: newSanctionsNumber,
          };
        }

        return factionMember;
      }),
    ];

    if (factionMemberToBeKickedOut) {
      factionPlayerIsLeaderFor.members =
        factionPlayerIsLeaderFor.members.filter(
          (factionMember) => factionMember.id !== factionMemberToBeKickedOut.id
        );

      // TODO: If player is online, give them a notice here that they've been kicked out of the faction
    }

    this.saveDBEntityAsync(factionPlayerIsLeaderFor.id);

    const wasPreviouslyInMenu =
      this.leadersSanctioningPlayers.get(playerId).wasPreviouslyInMenu;
    if (!wasPreviouslyInMenu) {
      this.factionMenu(playerId);
    } else {
      this.onRequestManageSanctions(true, playerId);
    }
    this.leadersSanctioningPlayers.delete(playerId);
    this.factionMenu(playerId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-warn-faction-member`,
  })
  public onRequestWarnMember(
    playerDBId: number,
    incrementBy: number,
    wasPreviouslyInMenu: boolean = false
  ): void {
    if (!playerDBId || !Number(playerDBId)) {
      return;
    }

    const playerId: number = source;
    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember: FactionMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) => factionMember.id === playerDBId
    );

    if (!existingMember) {
      return;
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, playerId, {
      title: this.translate(`title_member_${incrementBy < 1 ? 'un' : ''}warn`),
      content: this.translate(
        `title_member_${incrementBy < 1 ? 'un' : ''}warn_confirmation`
      ),
      dialogId: 'faction-confirm-warn-member',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });

    this.leadersSanctioningPlayers.set(playerId, {
      id: playerDBId,
      newSanctionsNumber: existingMember.warnings + incrementBy,
      wasPreviouslyInMenu,
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-modify-tester-status`,
  })
  public onConfirmModifyTesterStatus(): void {
    const playerId: number = source;

    if (!this.leadersManagingTesterStatuses.has(playerId)) {
      return;
    }

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember: FactionMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) =>
        factionMember.id === this.leadersManagingRanks.get(playerId).id
    );

    if (!existingMember) {
      return;
    }

    factionPlayerIsLeaderFor.members = [
      ...factionPlayerIsLeaderFor.members.map((factionMember) => ({
        ...factionMember,
        tester:
          factionMember.id ===
          this.leadersManagingTesterStatuses.get(playerId).id
            ? this.leadersManagingTesterStatuses.get(playerId).newTesterStatus
            : factionMember.tester,
      })),
    ];

    const newTesterStatus =
      this.leadersManagingTesterStatuses.get(playerId).newTesterStatus;
    if (newTesterStatus) {
      global.exports['factions-logs'].addToFactionLog(
        factionPlayerIsLeaderFor.internalId,
        `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
          'authentication'
        ].getPlayerInfo(playerId, 'name')} i-a ${
          newTesterStatus ? 'acordat' : 'revocat'
        } gradul de tester lui ${existingMember.onlineName}.`
      );
    }

    this.saveDBEntityAsync(factionPlayerIsLeaderFor.id);
    this.leadersManagingTesterStatuses.delete(playerId);

    this.onRequestManagePrivileges(true, playerId);
    this.factionMenu(playerId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-modify-tester-status`,
  })
  public onRequestModifyTesterStatus(
    playerDBId: number,
    _onlinePlayerId: number
  ): void {
    if (!playerDBId || !Number(playerDBId)) {
      return;
    }

    const playerId: number = source;
    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) => factionMember.id === Number(playerDBId)
    );
    if (!existingMember) {
      return;
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, {
      title: this.translate(
        `title_member_tester_${existingMember.tester ? 'un' : ''}make`
      ),
      content: this.translate(
        `title_member_tester_${
          existingMember.tester ? 'un' : ''
        }make_confirmation`
      ),
      dialogId: 'faction-confirm-manage-member-tester-status',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });

    const newTesterStatus: boolean = !existingMember.tester;
    this.leadersManagingTesterStatuses.set(playerId, {
      newTesterStatus,
      id: Number(playerDBId),
      onlineId: existingMember.onlineId || undefined,
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:confirm-increment-rank`,
  })
  public onConfirmIncrementRank(): void {
    const playerId: number = source;

    if (!this.leadersManagingRanks.has(playerId)) {
      return;
    }

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember: FactionMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) =>
        factionMember.id === this.leadersManagingRanks.get(playerId).id
    );

    if (!existingMember) {
      return;
    }

    const newRank: number = this.leadersManagingRanks.get(playerId).newRank;
    factionPlayerIsLeaderFor.members = [
      ...factionPlayerIsLeaderFor.members.map((factionMember) => {
        if (factionMember.id === this.leadersManagingRanks.get(playerId).id) {
          global.exports['factions-logs'].addToFactionLog(
            factionPlayerIsLeaderFor.internalId,
            `${factionPlayerIsLeaderFor.rankNames[6]} (6) ${global.exports[
              'authentication'
            ].getPlayerInfo(playerId, 'name')} i-a ${
              newRank < factionMember.rank ? 'scazut' : 'crescut'
            } rank-ul lui ${existingMember.onlineName} (${newRank}).`
          );

          return {
            ...factionMember,
            rank: newRank,
          };
        }

        return factionMember;
      }),
    ];

    this.saveDBEntityAsync(factionPlayerIsLeaderFor.id);
    this.leadersManagingRanks.delete(playerId);

    this.onRequestManagePrivileges(true, playerId);
    this.factionMenu(playerId);
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-increment-rank`,
  })
  public onRequestIncrementRank(
    playerDBId: number,
    _onlinePlayerId: number,
    incrementBy: number
  ): void {
    if (!playerDBId || !Number(playerDBId)) {
      return;
    }

    const playerId: number = source;
    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const existingMember = factionPlayerIsLeaderFor.members.find(
      (factionMember) => factionMember.id === Number(playerDBId)
    );
    const existingRank = existingMember?.rank;
    if (!existingMember || !existingRank) {
      return;
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, {
      title: this.translate(
        `title_member_rank_${incrementBy > 0 ? 'up' : 'down'}`
      ),
      content: this.translate(
        `title_member_rank_${incrementBy > 0 ? 'up' : 'down'}_confirmation`
      ),
      dialogId: 'faction-confirm-manage-member-rank',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });

    const newRank: number = existingRank + Number(incrementBy);
    this.leadersManagingRanks.set(playerId, {
      newRank,
      id: Number(playerDBId),
      onlineId: existingMember.onlineId || undefined,
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-manage-activity`,
  })
  public onRequestManageActivity(
    shouldOnlyUpdate: boolean = false,
    _source?: number
  ): void {
    const playerId: number = _source ?? source;

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    setImmediate(async () => {
      const allFactionMembersActivities = await global.exports[
        'factions-activity'
      ].getFactionActivityForMultipleAsync(
        factionPlayerIsLeaderFor.internalId,
        factionPlayerIsLeaderFor.members.map(
          (factionMember) => factionMember.id
        )
      );
      const allFactionMembers = (
        await this.getAllFactionMembersAsync(
          factionPlayerIsLeaderFor.internalId,
          true
        )
      ).map((factionMember) => ({
        ...factionMember,
        activity: allFactionMembersActivities[factionMember.id] || [],
      }));

      TriggerClientEvent(
        `${GetCurrentResourceName()}:${
          shouldOnlyUpdate ? 'update-dialog' : 'show-dialog'
        }`,
        playerId,
        {
          width: 500,
          title: this.translate('activity_manage'),
          content: this.translate('activity_manage_description'),
          dialogId: 'faction-member-activities',
          dialogComponents: [
            {
              type: 'stats',
              metadata: {
                items: allFactionMembers
                  .sort((a, b) => (a.rank > b.rank ? -1 : 1))
                  .map((factionMember) => {
                    const daysInFaction = Math.round(
                      Math.abs(
                        (Date.now() - factionMember.hireTimestamp) /
                          (24 * 60 * 60 * 1000)
                      )
                    );

                    return {
                      title:
                        factionMember.name +
                        (factionMember.onlineId === playerId
                          ? ` (${this.translate('you')}), `
                          : ', ') +
                        `${
                          factionPlayerIsLeaderFor.rankNames[
                            factionMember.rank
                          ] || 'Unnamed rank'
                        } (${factionMember.rank})` +
                        ` (${this.translate(
                          'seniority'
                        )}: ${daysInFaction} ${this.translate('days')})`,
                      ...factionMember.activity.reduce(
                        (previous, current) => ({
                          ...previous,
                          [`${this.translate(current.type)}`]: `${
                            current.points
                          } ${this.translate('points')}`,
                        }),
                        {}
                      ),
                    };
                  }),
              },
            },
          ],
          buttons: [
            {
              title: this.translate('confirm'),
            },
          ],
        }
      );
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-manage-sanctions`,
  })
  public onRequestManageSanctions(
    shouldOnlyUpdate: boolean = false,
    _source?: number
  ): void {
    const playerId: number = _source ?? source;

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    setImmediate(async () => {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:${
          shouldOnlyUpdate ? 'update-dialog' : 'show-dialog'
        }`,
        playerId,
        {
          width: 370,
          title: this.translate('sanctions_manage'),
          content: this.translate('sanctions_manage_description'),
          dialogId: 'faction-member-privileges',
          dialogComponents: [
            {
              type: 'stats',
              metadata: {
                items: (
                  await this.getAllFactionMembersAsync(
                    factionPlayerIsLeaderFor.internalId,
                    true
                  )
                )
                  .sort((a, b) => (a.rank > b.rank ? -1 : 1))
                  .map((factionMember) => {
                    const daysInFaction = Math.round(
                      Math.abs(
                        (Date.now() - factionMember.hireTimestamp) /
                          (24 * 60 * 60 * 1000)
                      )
                    );

                    return {
                      title:
                        factionMember.name +
                        (factionMember.onlineId === playerId
                          ? ` (${this.translate('you')})`
                          : ''),
                      rank: `${
                        factionPlayerIsLeaderFor.rankNames[
                          factionMember.rank
                        ] || 'Unnamed rank'
                      } (${factionMember.rank})`,
                      [this.translate('labels_hire_date')]: new Date(
                        factionMember.hireTimestamp || 0
                      ).toLocaleDateString(),
                      [this.translate('labels_time_since_hire')]:
                        daysInFaction + ' ' + this.translate('days'),
                      [this.translate(
                        'labels_warnings'
                      )]: `${factionMember.warnings}/3`,
                      [this.translate('labels_tester')]: `${
                        factionMember.rank >= 6 || factionMember.tester
                          ? this.translate('yes')
                          : this.translate('no')
                      }`,
                      metadata: {
                        buttons:
                          factionMember.onlineId === playerId
                            ? []
                            : [
                                {
                                  icon: 'priority_high',
                                  label: this.translate('sanction_do'),
                                  color: 'red',
                                  buttonId: `sanction_up_${factionMember.id}_${
                                    factionMember.onlineId || -1
                                  }`,
                                  disabled: factionMember.onlineId === playerId,
                                  wide: true,
                                },
                                {
                                  icon: 'keyboard_double_arrow_down',
                                  label: this.translate('sanction_undo'),
                                  color: 'green',
                                  wide: true,
                                  buttonId: `sanction_down_${
                                    factionMember.id
                                  }_${factionMember.onlineId || -1}`,
                                  disabled:
                                    factionMember.onlineId === playerId ||
                                    factionMember.warnings === 0,
                                },
                              ],
                      },
                    };
                  }),
              },
            },
          ],
          buttons: [
            {
              title: this.translate('confirm'),
            },
          ],
        }
      );
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-manage-privileges`,
  })
  public onRequestManagePrivileges(
    shouldOnlyUpdate: boolean = false,
    _source?: number
  ): void {
    const playerId: number = _source ?? source;

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    setImmediate(async () => {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:${
          shouldOnlyUpdate ? 'update-dialog' : 'show-dialog'
        }`,
        playerId,
        {
          width: 370,
          title: this.translate('manage_members'),
          content: this.translate('manage_members_description'),
          dialogId: 'faction-member-privileges',
          dialogComponents: [
            {
              type: 'stats',
              metadata: {
                items: (
                  await this.getAllFactionMembersAsync(
                    factionPlayerIsLeaderFor.internalId,
                    true
                  )
                )
                  .sort((a, b) => (a.rank > b.rank ? -1 : 1))
                  .map((factionMember) => {
                    const daysInFaction = Math.round(
                      Math.abs(
                        (Date.now() - factionMember.hireTimestamp) /
                          (24 * 60 * 60 * 1000)
                      )
                    );

                    return {
                      title:
                        factionMember.name +
                        (factionMember.onlineId === playerId
                          ? ` (${this.translate('you')})`
                          : ''),
                      rank: `${
                        factionPlayerIsLeaderFor.rankNames[
                          factionMember.rank
                        ] || 'Unnamed rank'
                      } (${factionMember.rank})`,
                      [this.translate('labels_hire_date')]: new Date(
                        factionMember.hireTimestamp || 0
                      ).toLocaleDateString(),
                      [this.translate('labels_time_since_hire')]:
                        daysInFaction + ' ' + this.translate('days'),
                      [this.translate(
                        'labels_warnings'
                      )]: `${factionMember.warnings}/3`,
                      [this.translate('labels_tester')]: `${
                        factionMember.rank >= 6 || factionMember.tester
                          ? this.translate('yes')
                          : this.translate('no')
                      }`,
                      metadata: {
                        buttons:
                          factionMember.onlineId === playerId
                            ? []
                            : [
                                {
                                  icon: 'keyboard_double_arrow_up',
                                  label: this.translate('rank_up'),
                                  color: 'green',
                                  buttonId: `rank_up_${factionMember.id}_${
                                    factionMember.onlineId || -1
                                  }`,
                                  disabled: factionMember.rank >= 6,
                                },
                                {
                                  icon: 'keyboard_double_arrow_down',
                                  label: this.translate('rank_down'),
                                  color: 'red',
                                  wide: true,
                                  buttonId: `rank_down_${factionMember.id}_${
                                    factionMember.onlineId || -1
                                  }`,
                                  disabled: factionMember.rank <= 1,
                                },
                                {
                                  icon: 'star',
                                  label: this.translate('labels_tester'),
                                  color: 'blue',
                                  buttonId: `make_tester_${factionMember.id}_${
                                    factionMember.onlineId || -1
                                  }`,
                                  disabled:
                                    factionMember.rank <= 1 ||
                                    factionMember.rank >= 6,
                                },
                              ],
                      },
                    };
                  }),
              },
            },
          ],
          buttons: [
            {
              title: this.translate('confirm'),
            },
          ],
        }
      );
    });
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:confirm-call-tow` })
  public onConfirmCallTow(): void {
    const playerId: number = source;

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    const abandonedFactionVehicles: number[] =
      global.exports[
        `factions-${factionPlayerIsLeaderFor.internalId}`
      ].getAbandonedVehiclesNetworkIds();

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, playerId, {
      title: this.translate('title_call_tow'),
      content: this.translate('title_call_tow_success'),
      dialogId: 'blank',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });
    emit(
      'factions-tcc:add-to-pending-tow-calls',
      ...abandonedFactionVehicles.map((vehicleNetworkId) => ({
        vehicleNetworkId,
        originalX: factionPlayerIsLeaderFor.entranceX,
        originalY: factionPlayerIsLeaderFor.entranceY,
        originalZ: factionPlayerIsLeaderFor.entranceZ,
        range: factionPlayerIsLeaderFor.towRange || 100.0,
      }))
    );
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:request-call-tow` })
  public onRequestCallTow(): void {
    const playerId: number = source;

    const factionPlayerIsLeaderFor: Faction =
      this.getPlayerFactionWhoTheyAreLeaderFor(playerId);
    if (!factionPlayerIsLeaderFor) {
      return;
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, playerId, {
      title: this.translate('title_call_tow'),
      content: this.translate('title_call_tow_confirmation', {
        price: numberWithCommas(1000 /*TODO: Replace this*/),
      }),
      dialogId: 'faction-confirm-call-tow',
      buttons: [
        {
          title: this.translate('confirm'),
        },
      ],
    });
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    const playerId: number = source;
    this.entities.forEach((faction: Faction) => {
      const loggedOutPlayerFactionMemberData: FactionMember =
        faction.members.find(
          (_factionMember: FactionMember) =>
            _factionMember.onlineId === playerId
        );

      if (loggedOutPlayerFactionMemberData) {
        loggedOutPlayerFactionMemberData.onlineId = null;
        return;
      }
    });

    if (this.onlinePlayersWithFactions.has(playerId)) {
      this.factionsWithOnlinePlayers.get(
        this.onlinePlayersWithFactions.get(playerId)
      );
      this.factionsWithOnlinePlayers.set(
        this.onlinePlayersWithFactions.get(playerId),
        this.factionsWithOnlinePlayers
          .get(this.onlinePlayersWithFactions.get(playerId))
          .filter(
            (onlineFactionMember: number) => onlineFactionMember !== playerId
          )
      );
      this.onlinePlayersWithFactions.delete(playerId);
    }

    if (this.leadersManagingRanks.has(playerId)) {
      this.leadersManagingRanks.delete(playerId);
    }

    if (this.leadersSanctioningPlayers.has(playerId)) {
      this.leadersSanctioningPlayers.delete(playerId);
    }

    if (this.leadersManagingTesterStatuses.has(playerId)) {
      this.leadersManagingTesterStatuses.delete(playerId);
    }
  }

  @EventListener()
  public onPlayerAuthenticate(
    playerAuthenticated: number,
    playerInfo: Player
  ): void {
    this.entities.forEach((faction: Faction) => {
      const authenticatedPlayerFactionMemberData: FactionMember =
        faction.members.find(
          (_factionMember: FactionMember) => _factionMember.id === playerInfo.id
        );

      if (authenticatedPlayerFactionMemberData) {
        authenticatedPlayerFactionMemberData.onlineId = playerAuthenticated;
        authenticatedPlayerFactionMemberData.onlineName = playerInfo.name;
        this.onlinePlayersWithFactions.set(
          playerAuthenticated,
          faction.internalId
        );
        this.factionsWithOnlinePlayers.set(faction.internalId, [
          ...(this.factionsWithOnlinePlayers.get(faction.internalId) || []),
          playerAuthenticated,
        ]);
        return;
      }
    });
  }

  @Command()
  public enterFaction(source: number): void {
    const faction: Faction =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);

    if (!faction) {
      global.exports['chat'].addMessage(
        source,
        "Couldn't find a valid faction entrance."
      );
      return;
    }

    SetEntityCoords(
      GetPlayerPed(source),
      faction.exitX,
      faction.exitY,
      faction.exitZ,
      true,
      false,
      false,
      true
    );
    this.setPlayerVirtualWorld(source, faction.id);
  }

  @Command()
  public exitFaction(source: number): void {
    const faction: Faction =
      this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (faction == null) {
      global.exports['chat'].addMessage(
        source,
        "Couldn't find a valid faction exit."
      );
      return;
    }

    SetEntityCoords(
      GetPlayerPed(source),
      faction.entranceX,
      faction.entranceY,
      faction.entranceZ,
      true,
      false,
      false,
      true
    );
    SetEntityRoutingBucket(GetPlayerPed(source), 0);
  }

  @Command({ adminLevelRequired: 6 })
  public setFactionRankName(source: number, args: string[]): void {
    const factionInternalId: string = args[0];
    const rank: number = Number(args[1]);
    const rankName: string = args.slice(2).join(' ');

    console.log(factionInternalId, ',', rank, ',', rankName);

    if (!factionInternalId || !rank || !rankName.length) {
      global.exports['chat'].addMessage(
        source,
        'Syntax: /setfactionrankname <factionInternalId> <rankNumber> <rankName>'
      );
      return;
    }

    const faction: Faction = this.getEntities().find(
      (_faction) => _faction.internalId === factionInternalId
    );
    if (!faction) {
      global.exports['chat'].addMessage(source, 'Invalid faction.');
      return;
    }

    faction.rankNames[rank] = rankName;
    this.saveDBEntityAsync(faction.id);

    global.exports['chat'].addMessage(
      source,
      `You have successfully changed the name of rank ${rank} to ${rankName} for faction ${factionInternalId}.`
    );
  }

  @Command({ adminLevelRequired: 6 })
  public removeFaction(source: number, args: any[]): void {
    let faction: Faction = this.getClosestEntityOfSameTypeToPlayer(source);
    if (args && args[0]) {
      faction =
        this.getEntityByDBId(Number(args[0])) ||
        this.getClosestEntityOfSameTypeToPlayer(source);
    }

    if (!faction) {
      console.log('Failed - Faction undefined');
      return;
    }

    console.log(
      global.exports['authentication'].getPlayerInfo(source, 'name'),
      'removed a faction!'
    );
    this.removeEntity(faction);
  }

  @Command({ adminLevelRequired: 6 })
  public createFaction(source: number, args: any[]): void {
    if (args.length < 3) {
      console.log('Syntax: /createfaction <factionId> <factionName>!');
      return;
    }
    const factionId: string = args[0];
    const factionName: string = args.slice(1).join(' ');
    const position: number[] = GetEntityCoords(GetPlayerPed(source), true);

    this.createEntity({
      id: -1,
      name: factionName,
      internalId: factionId,
      blipId: -1,
      entranceX: position[0],
      entranceY: position[1],
      entranceZ: position[2],
      exitX: 0.0,
      exitY: 0.0,
      exitZ: 0.0,
      members: [],
      towRange: 100.0,
      rankNames: {
        1: 'Unnamed rank',
        2: 'Unnamed rank',
        3: 'Unnamed rank',
        4: 'Unnamed rank',
        5: 'Unnamed rank',
        6: 'Unnamed rank',
      },
    } as Faction);
  }

  @Command()
  public factionMenu(source: number): void {
    const playerId: number = source;
    if (!this.onlinePlayersWithFactions.has(playerId)) {
      return;
    }

    const faction: Faction = this.entities.find(
      (_faction: Faction) =>
        _faction.internalId === this.onlinePlayersWithFactions.get(playerId)
    );

    if (!faction) {
      console.log('Failed to show factionmenu to ', GetPlayerName(playerId));
      return;
    }

    setImmediate(async () => {
      TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, playerId, {
        stats: (
          await this.getAllFactionMembersAsync(
            this.onlinePlayersWithFactions.get(playerId),
            true
          )
        )
          .sort((a, b) => (a.rank > b.rank ? -1 : 1))
          .map((factionMember) => {
            return {
              key: factionMember.name,
              value: `${faction.rankNames[factionMember.rank]} (${
                factionMember.rank
              })`,
              buttons: [
                {
                  color: 'blue',
                  icon: 'edit',
                  buttonId: `faction_menu_edit_${factionMember.id}`,
                },
                ...(factionMember.onlineId !== playerId
                  ? [
                      {
                        color: 'yellow',
                        icon: 'priority_high',
                        buttonId: `faction_menu_warn_${factionMember.id}`,
                      },
                    ]
                  : []),
                ...(factionMember.onlineId !== playerId
                  ? [
                      {
                        color: 'red',
                        icon: 'logout',
                        buttonId: `faction_menu_kick_${factionMember.id}`,
                      },
                    ]
                  : []),
              ],
              metadata: {
                onlineStatus:
                  factionMember.onlineId >= 0 ? 'online' : 'offline',
              },
            };
          }),
        items: faction.members.map((_factionMember: FactionMember) => ({
          outline: '#404158',
          topLeft: '1',
          bottomRight: '',
          width: 65,
          image: '1',
        })),
        leftMenu: {
          description: this.translate('faction_management'),
          buttons: [
            {
              title: this.translate('motd_long'),
              subtitle: this.translate('motd_description'),
              icon: 'campaign',
            },
            {
              title: this.translate('meeting_schedule'),
              subtitle: this.translate('meeting_schedule_description'),
              icon: 'groups',
            },
            {
              title: this.translate('request_tow'),
              subtitle: this.translate('request_tow_description'),
              icon: 'rv_hookup',
            },
            {
              title: this.translate('salaries_pay'),
              subtitle: this.translate('salaries_pay_description'),
              icon: 'attach_money',
            },
          ],
        },
        rightMenu: {
          description: this.translate('individual_member_management'),
          buttons: [
            {
              title: this.translate('privileges_manage'),
              subtitle: this.translate('privileges_manage_description'),
              icon: 'star_rate',
            },
            {
              title: this.translate('sanctions_manage'),
              subtitle: this.translate('sanctions_manage_description'),
              icon: 'report',
            },
            {
              title: this.translate('work_report_check'),
              subtitle: this.translate('work_report_check_description'),
              icon: 'shield',
            },
          ],
        },
        title: this.translate('faction_menu_title', {
          name: faction.name,
          memberCount: faction.members.length.toString(),
        }),
        resource: GetCurrentResourceName(),
        isWide: true,
        bottomSide: 'news',
        news: await global.exports['factions-logs'].getFactionLogs(
          faction.internalId
        ),
      });
    });
  }

  @Export()
  public getOnlineFactionMembers(internalId: string): FactionMember[] {
    const faction: Faction = this.entities.find(
      (_faction: Faction) => _faction.internalId === internalId
    );

    if (faction) {
      return faction.members.filter(
        (factionMember: FactionMember) => factionMember.onlineId != null
      );
    }

    return [];
  }

  @Export()
  public async getAllFactionMembersAsync(
    internalId: string,
    withNames: boolean = false
  ): Promise<(FactionMember & { name?: string })[]> {
    const faction: Faction = this.entities.find(
      (faction: Faction) => faction.internalId === internalId
    );
    const factionMembers =
      <(FactionMember & { name?: string })[]>faction?.members || [];

    if (withNames) {
      const filteredFactionMembers = await Promise.all(
        factionMembers.map(
          async (factionMember) =>
            <FactionMember & { name?: string }>{
              ...factionMember,
              name:
                factionMember.onlineName ||
                (
                  await global.exports['authentication'].getOfflinePlayerInfo(
                    factionMember.id,
                    'name'
                  )
                )?.name ||
                'Undefined',
            }
        )
      );

      faction.members = faction.members.map(
        // Caches the queried name
        (factionMember) => {
          if (factionMember.onlineName) {
            return factionMember;
          }

          const filteredFactionMember = filteredFactionMembers.find(
            (_factionMember) => _factionMember.id === factionMember.id
          );

          if (filteredFactionMember && filteredFactionMember.name) {
            return {
              ...factionMember,
              name: filteredFactionMember.name,
              onlineName: filteredFactionMember.name,
            };
          }

          return factionMember;
        }
      );

      return filteredFactionMembers;
    }

    return factionMembers;
  }

  @Export()
  public getFaction(internalId: string): Faction {
    return this.entities.find(
      (faction: Faction) => faction.internalId === internalId
    );
  }

  @Export()
  public isPlayerMemberOfFaction(
    internalId: string,
    playerId: number,
    playerDBId?: number
  ): boolean {
    return this.getFaction(internalId)?.members.some(
      (factionMember: FactionMember) =>
        (playerDBId !== -1 && factionMember.id === playerDBId) ||
        factionMember.onlineId === playerId
    );
  }

  @Export()
  public getFactionMemberRank(internalId: string, playerId: number): number {
    return Number(
      this.getFaction(internalId)?.members.find(
        (factionMember: FactionMember) => factionMember.onlineId === playerId
      )?.rank
    );
  }

  @Export()
  private getPlayerFactionWhoTheyAreLeaderFor(
    playerId: number
  ): Faction | null {
    if (this.onlinePlayersWithFactions.has(playerId)) {
      const playerFactionInternalId: string =
        this.onlinePlayersWithFactions.get(playerId);

      const faction: Faction = this.getEntities().find(
        (_faction) => _faction.internalId === playerFactionInternalId
      );

      if (
        this.isPlayerMemberOfFaction(playerFactionInternalId, playerId) &&
        this.getFactionMemberRank(playerFactionInternalId, playerId) >= 6
      ) {
        return faction;
      }
    }

    return null;
  }
}
