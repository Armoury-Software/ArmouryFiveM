import {
  Command,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerEntityWithEntranceController } from '@core/server/entity-controllers/server-entity-entrance.controller';
import { Faction, FactionMember } from '@shared/models/faction.interface';

import { Player } from '../../../../authentication/src/shared/models/player.model';

@FiveMController()
export class Server extends ServerEntityWithEntranceController<Faction> {
  public constructor(dbTableName: string) {
    super(dbTableName, true);

    this.registerCommands();
    this.registerExports();
    this.registerListeners();
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
    SetEntityRoutingBucket(GetPlayerPed(source), faction.id);
  }

  @Command()
  public exitFaction(source: number): void {
    const faction: Faction =
      this.getClosestEntityOfSameTypeExitToPlayer(source);

    if (!faction) {
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

  public getAllFactionMembers(internalId: string): FactionMember[] {
    return (
      this.entities.find(
        (faction: Faction) => faction.internalId === internalId
      )?.members || []
    );
  }

  public getFaction(internalId: string): Faction {
    return this.entities.find(
      (faction: Faction) => faction.internalId === internalId
    );
  }

  @Export()
  public isPlayerMemberOfFaction(
    internalId: string,
    playerId: number
  ): boolean {
    return this.getFaction(internalId)?.members.some(
      (factionMember: FactionMember) => factionMember.onlineId === playerId
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

  private registerCommands(): void {
    this.RegisterAdminCommand(
      'removefaction',
      6,
      (source: number, args: any[]) => {
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
      },
      false
    );

    this.RegisterAdminCommand(
      'createfaction',
      6,
      (source: number, args: any[]) => {
        if (args.length < 3) {
          console.log('Syntax: /createfaction <factionId> <factionName>!');
          return;
        }
        const factionId: string = args[0];
        const factionName: string = args.slice(1).join(' ');
        const position: number[] = GetEntityCoords(GetPlayerPed(source), true);

        this.createEntity({
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
        } as Faction);
      },
      false
    );

    RegisterCommand(
      'factionmenu',
      (source: number) => {
        const faction: Faction = this.entities.find(
          (_faction: Faction) => _faction.internalId === 'taxi'
        ); // TODO: Use actual faction internalId

        if (!faction) {
          console.log('Failed to show factionmenu to ', GetPlayerName(source));
          return;
        }

        TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source, {
          stats: [
            { key: 'Name', value: 'Taxi Cab Company' },
            { key: 'Leader', value: 'Tony Delgado' },
            { key: 'Members', value: '1' },
          ],
          items: faction.members.map((_factionMember: FactionMember) => ({
            outline: '#404158',
            topLeft: '1',
            bottomRight: '',
            width: 65,
            image: '1',
          })),
          leftMenu: {
            description: 'Faction Management',
            buttons: [
              {
                title: 'Message Of The Day',
                subtitle: 'Change the MOTD of the faction',
                icon: 'campaign',
              },
              {
                title: 'Schedule Meeting',
                subtitle: 'Schedule a meeting with all members',
                icon: 'groups',
              },
              {
                title: 'Respawn Vehicles (FVR)',
                subtitle: 'Respawn all faction vehicles.',
                icon: 'rv_hookup',
              },
              {
                title: 'Pay Salaries',
                subtitle: 'Pay all salaries immediately',
                icon: 'attach_money',
              },
            ],
          },
          rightMenu: {
            description: 'Individual Member Management',
            buttons: [
              {
                title: 'Manage Privileges',
                subtitle: 'Rank up/down, make tester, etc.',
                icon: 'star_rate',
              },
              {
                title: 'Manage Faction Sanctions',
                subtitle: 'View, Add or Remove faction sanctions.',
                icon: 'report',
              },
              {
                title: 'Set Member Note',
                subtitle: 'Set a note about this member.',
                icon: 'shield',
              },
              {
                title: 'Check Work Report',
                subtitle: "Check Member's Work Report.",
                icon: 'shield',
              },
              {
                title: 'Uninvite',
                subtitle: 'Uninvite this member.',
                icon: 'exit_to_app',
              },
            ],
          },
          title: `Faction Menu - ${faction.name} (${faction.members.length} Members)`,
          resource: GetCurrentResourceName(),
        });
      },
      false
    );
  }

  private registerExports(): void {
    exports('getOnlineFactionMembers', this.getOnlineFactionMembers.bind(this));
    exports('getAllFactionMembers', this.getAllFactionMembers.bind(this));
    exports('getFaction', this.getFaction.bind(this));
  }

  private registerListeners(): void {
    onNet(
      'authentication:player-authenticated',
      (playerAuthenticated: number, playerInfo: Player) => {
        this.entities.forEach((faction: Faction) => {
          const authenticatedPlayerFactionMemberData: FactionMember =
            faction.members.find(
              (_factionMember: FactionMember) =>
                _factionMember.id === playerInfo.id
            );

          if (authenticatedPlayerFactionMemberData) {
            authenticatedPlayerFactionMemberData.onlineId = playerAuthenticated;
            return;
          }
        });
      }
    );

    onNet('authentication:player-logout', (playerLoggedOut: number) => {
      this.entities.forEach((faction: Faction) => {
        const loggedOutPlayerFactionMemberData: FactionMember =
          faction.members.find(
            (_factionMember: FactionMember) =>
              _factionMember.onlineId === playerLoggedOut
          );

        if (loggedOutPlayerFactionMemberData) {
          loggedOutPlayerFactionMemberData.onlineId = null;
          return;
        }
      });
    });
  }
}
