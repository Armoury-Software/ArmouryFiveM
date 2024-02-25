import {
  Controller,
  ServerController,
  EventListener,
  Export,
  numberWithCommas,
  toThousandsString,
  isJSON,
} from '@armoury/fivem-framework';
import { Account } from '@shared/models/account.model';
import { AuthenticationDTO } from '@shared/models/authentication.model';
import { PlayerInfoType } from '@shared/models/player-info.type';
import { Player, PlayerBase, PlayerMonitored } from '@shared/models/player.model';
import { whirlpool } from 'hash-wasm';

@Controller()
export class Server extends ServerController {
  private cachedPlayerProperties: string[] = [];
  private authenticatedPlayers: Map<number, PlayerMonitored> = new Map();
  private playersAuthenticatedWithAccountIds: Map<number, number> = new Map();

  private maxIdOnServer: number = 0;

  @EventListener({ eventName: `${Cfx.Server.GetCurrentResourceName()}:authenticate` })
  public async onAuthenticateBegin(data: AuthenticationDTO, _source?: number): Promise<void> {
    const playerId: number = _source ?? Cfx.source;

    // prettier-ignore
    const hashedPassword: string = await whirlpool(this.getHashPasswordWithSalt(data.password, data.email));

    if (!data.isAuthenticating) {
      try {
        const createdAccountId: number = await global.exports['oxmysql'].insert_async(
          'INSERT INTO `accounts`(`name`, `password`, `email`) VALUES (?, ?, ?)',
          [Cfx.Server.GetPlayerName(playerId.toString()), hashedPassword, data.email]
        );

        if (createdAccountId) {
          this.onAuthenticateBegin(
            {
              email: data.email,
              password: data.password,
              isAuthenticating: true,
            },
            playerId
          );
        } else {
          throw new Error();
        }
      } catch (error) {
        Cfx.TriggerClientEvent(
          `${Cfx.Server.GetCurrentResourceName()}:register-error`,
          playerId,
          'Registration failed - that email already exists.'
        );
      }
    } else {
      const result: Account = await global.exports['oxmysql'].single_async(
        'SELECT * FROM `accounts` WHERE email=? AND password=?',
        [data.email, hashedPassword]
      );

      if (result) {
        this.authenticatePlayer(playerId, result);
      } else {
        // prettier-ignore
        Cfx.TriggerClientEvent('authentication:login-error', playerId, 'Authentication failed - incorrect email and password combination.');
      }
    }
  }

  @Export()
  public setPlayerInfo(
    source: number,
    stat: string,
    _value: PlayerInfoType,
    ignoreSQLCommand: boolean = true,
    ...additionalValues: { stat: string; _value: PlayerInfoType }[]
  ): void {
    let value = _value;

    if (Array.isArray(_value) || typeof _value === 'object') {
      value = JSON.stringify(_value);
    }

    if (stat === 'cash') {
      global.exports['armoury-overlay'].updateItem(source, {
        id: stat,
        icon: 'attach_money',
        value:
          '$' +
          (Math.abs(<number>value) < 999999 ? numberWithCommas(<number>value) : toThousandsString(<number>value, 2)),
      });

      const previousValue: number = this.getPlayerInfo(source, 'cash');
      const difference: number = Number(value) - Number(previousValue || 0);
      if (difference !== 0 && previousValue !== 0) {
        global.exports['armoury-overlay'].showMoneyGainOverlay(source, difference);
      }
    }

    if (stat === 'id') {
      if (<number>value > this.maxIdOnServer) {
        this.maxIdOnServer = <number>value;
      }

      global.exports['armoury-overlay'].updateItem(source, {
        id: stat,
        icon: 'person',
        value: value.toString().padStart(Math.max(6, this.maxIdOnServer.toString().length), '0'),
      });
    }

    Cfx.Server.SetConvarReplicated(`${source}_PI_${stat}`, value.toString());

    if (!ignoreSQLCommand && this.cachedPlayerProperties.includes(stat)) {
      let statsString: string = `${stat} = ?`;
      additionalValues.forEach((additionalValue) => {
        statsString += `, ${additionalValue.stat} = ?`;
      });

      global.exports['oxmysql'].update_async(`UPDATE \`players\` SET ${statsString} WHERE id = ?`, [
        value,
        ...additionalValues.map((additionalValue) =>
          Array.isArray(additionalValue._value) || typeof additionalValue._value === 'object'
            ? JSON.stringify(additionalValue._value)
            : additionalValue._value
        ),
        this.getPlayerInfo(source, 'id'),
      ]);
    }
  }

  @Export()
  public async getOfflinePlayerInfo(
    playerDBId: number,
    ...stats: string[]
  ): Promise<{ [key: string]: PlayerInfoType }[]> {
    let value: PlayerInfoType = await global.exports['oxmysql'].query_async(
      `SELECT ${stats.join(',')} FROM players WHERE id = ?`,
      [playerDBId]
    );

    return value?.[0] || null;
  }

  @Export()
  public getPlayerInfo<T extends PlayerInfoType>(source: number, stat: string): T {
    let value: PlayerInfoType = Cfx.Server.GetConvar(`${source}_PI_${stat}`, '-1');

    if (isJSON(value.toString())) {
      value = JSON.parse(value, function (_k, v) {
        return typeof v === 'object' || isNaN(v) ? v : Number(v);
      });
    }

    if (stat === 'hoursPlayed') {
      const computedHoursPlayed: number = Number(value) + this.computeHoursPlayed(source);
      this.setPlayerInfo(source, stat, computedHoursPlayed);

      return <T>computedHoursPlayed;
    }

    return <T>value;
  }

  @Export()
  public getAuthenticatedPlayers(withData?: boolean) {
    if (withData) {
      return Array.from(this.authenticatedPlayers.keys()).reduce(
        (previous, current) => ({
          ...previous,
          [current]: this.authenticatedPlayers.get(current),
        }),
        {}
      );
    }

    return Array.from(this.authenticatedPlayers.keys());
  }

  private computeHoursPlayed(source: number): number {
    let computedHoursPlayed: number = 0;
    if (this.authenticatedPlayers.has(source)) {
      computedHoursPlayed =
        Math.floor(
          (Math.abs(this.authenticatedPlayers.get(source).lastHoursPlayedCheck.getTime() - new Date().getTime()) /
            (1000 * 60)) %
            60
        ) * 0.017;

      this.authenticatedPlayers.set(source, {
        ...this.authenticatedPlayers.get(source),
        lastHoursPlayedCheck: new Date(),
      });
    }

    return computedHoursPlayed;
  }

  private async authenticatePlayer(target: number, account: Account): Promise<void> {
    const characters: Player[] = await global.exports['oxmysql'].query_async(
      `SELECT * FROM players WHERE accountId = ?`,
      [account.id]
    );

    if (characters) {
      this.playersAuthenticatedWithAccountIds.set(target, account.id);

      Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:account-success-client`, target);
      Cfx.emit(`${Cfx.Server.GetCurrentResourceName()}:account-success`, target, characters);
    } else {
      // prettier-ignore
      Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:account-login-error`, target, 'Authentication failed - unknown error occured.');
    }
  }

  private loadPlayerCharacter(target: number, stats: Player): void {
    this.setBasicOverlaysFor(target);
    global.exports['armoury'].unblockPlayerTime(target);

    for (var property in stats) {
      if (stats.hasOwnProperty(property)) {
        this.setPlayerInfo(target, property, stats[property]);
        if (this.cachedPlayerProperties.indexOf(property) === -1) {
          this.cachedPlayerProperties.push(property);
        }
      }
    }

    this.authenticatedPlayers.set(target, {
      ...(<PlayerMonitored>(<PlayerBase>stats)),
      lastHoursPlayedCheck: new Date(),
    });

    this.spawnPlayer(target, !(<number[]>this.getPlayerInfo(target, 'lastLocation'))?.length);

    Cfx.TriggerClientEvent('authentication:success', target);
    Cfx.emit('authentication:player-authenticated', target, stats);

    this.playersAuthenticatedWithAccountIds.delete(target);
  }

  @EventListener({ eventName: 'character-creation:character-selected' })
  public async onCharacterSelected(character: any, _source?: number): Promise<void> {
    const playerId: number = _source ?? Cfx.source;
    if (Number(character.age) > 0) {
      const player: Player = await global.exports['oxmysql'].single_async(
        'SELECT * FROM `players` WHERE id=? AND accountId=?',
        [character.id, this.playersAuthenticatedWithAccountIds.get(playerId)]
      );

      if (player) {
        this.loadPlayerCharacter(playerId, player);
      } else {
        // prettier-ignore
        Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:login-error`, playerId, 'Authentication failed - unknown error.');
      }
    }
  }

  @EventListener({ eventName: 'character-creation:character-created' })
  public async onCharacterCreated(character: any, _source?: number): Promise<void> {
    const playerId: number = _source ?? Cfx.source;
    try {
      const createdCharacterId: Player = await global.exports['oxmysql'].insert_async(
        'INSERT INTO `players`(`accountId`, `name`, `cash`, `bank`, `outfit`) VALUES (?, ?, ?, ?, ?)',
        [
          this.playersAuthenticatedWithAccountIds.get(playerId),
          character.name,
          REGISTRATION_STATS.defaultCash,
          REGISTRATION_STATS.defaultBank,
          JSON.stringify(
            character.componentVariations.reduce(
              (previous, current, index) => ({
                ...previous,
                components: {
                  ...previous.components,
                  [index]: {
                    drawableId: current[0],
                    textureId: current[1],
                    paletteId: current[2],
                  },
                },
              }),
              {
                components: {
                  clothingId: ['clothing', playerId, Date.now().toString().substring(-8)].join('_'),
                },
                title: ['clothing', playerId, Date.now().toString().substring(-8)].join('_'),
              }
            )
          ),
        ]
      );

      if (createdCharacterId) {
        this.onCharacterSelected({ ...character, id: createdCharacterId }, playerId);
      } else {
        throw new Error();
      }
    } catch (error) {
      // prettier-ignore
      console.log(`An error has occured when creating the character for ${character.name} ([${playerId}] ${Cfx.Server.GetPlayerName(playerId.toString())})`);
    }
  }

  @EventListener()
  public onPlayerConnect(): void {
    global.exports['armoury'].blockPlayerTime(Cfx.source, 0, 0, 0);
  }

  private spawnPlayer(target: number, spawnAtDefault?: boolean): void {
    const lastLocation = <number[]>this.getPlayerInfo(target, 'lastLocation');
    const position: number[] = !spawnAtDefault
      ? lastLocation.slice(0, 4)
      : [248.3087615966797, -342.34698486328127, 44.46502304077148];

    if (lastLocation && lastLocation[4]) {
      Cfx.Server.SetEntityRoutingBucket(Cfx.Server.GetPlayerPed(target.toString()), lastLocation[4]);
    }

    Cfx.TriggerClientEvent('authentication:spawn-player', target, position);
  }

  @EventListener()
  public onResourceStop(resourceName: string): void {
    if (resourceName === Cfx.Server.GetCurrentResourceName()) {
      Array.from(this.authenticatedPlayers.keys()).forEach((player: number) => {
        this.savePlayerCriticalStats(player);
      });

      this.authenticatedPlayers.clear();
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();

    this.savePlayerCriticalStats(Cfx.source);
    Cfx.emit(`${Cfx.Server.GetCurrentResourceName()}:player-logout`, Cfx.source);
    this.clearPlayerInfo(Cfx.source);
  }

  // Saves critical and/or frequently-updated data into MySQL Database
  private savePlayerCriticalStats(player: number): void {
    if (this.authenticatedPlayers.has(player)) {
      const playerPed = Cfx.Server.GetPlayerPed(player.toString());

      this.setPlayerInfo(
        player,
        'hoursPlayed',
        Number(this.getPlayerInfo(player, 'hoursPlayed')),
        false,
        { stat: 'cash', _value: Number(this.getPlayerInfo(player, 'cash')) },
        { stat: 'bank', _value: Number(this.getPlayerInfo(player, 'bank')) },
        { stat: 'weapons', _value: this.getPlayerInfo(player, 'weapons') },
        { stat: 'drugs', _value: this.getPlayerInfo(player, 'drugs') },
        { stat: 'xp', _value: this.getPlayerInfo(player, 'xp') },
        {
          stat: 'hunger',
          _value: global.exports['human-needs'].getPlayerHungerLevel(player),
        },
        {
          stat: 'thirst',
          _value: global.exports['human-needs'].getPlayerThirstLevel(player),
        },
        {
          stat: 'lastLocation',
          _value: [
            Cfx.Server.GetEntityCoords(playerPed)[0],
            Cfx.Server.GetEntityCoords(playerPed)[1],
            Cfx.Server.GetEntityCoords(playerPed)[2],
            Cfx.Server.GetEntityHeading(playerPed),
            Cfx.Server.GetEntityRoutingBucket(playerPed),
          ],
        }
      );
      this.authenticatedPlayers.delete(player);
    }
  }

  private getHashPasswordWithSalt(password: string, email: string): string {
    return email.slice(0, 3) + password + email.slice(3, 6);
  }

  private clearPlayerInfo(source: number): void {
    this.cachedPlayerProperties.forEach((property: string) => {
      Cfx.Server.SetConvarReplicated(`${source}_PI_${property}`, '-1');
    });
  }

  private setBasicOverlaysFor(playerId: number): void {
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'cash',
      icon: 'attach_money',
      value: '$0',
    });
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'id',
      icon: 'person',
      value: 'ID 0',
    });
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'level',
      icon: 'hourglass_bottom',
      value: 'Level 1',
    });
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'hunger',
      icon: 'lunch_dining',
      value: '100%',
    });
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'thirst',
      icon: 'water_drop',
      value: '100%',
    });
    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'mic',
      icon: 'volume_down',
      value: '0%',
      redIgnored: true,
    });
  }
}

// TODO: Extract this to an injection token, configurable for this resource
const REGISTRATION_STATS = {
  defaultCash: 500,
  defaultBank: 1000,
};
