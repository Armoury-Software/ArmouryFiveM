import { whirlpool } from 'hash-wasm';

import { authenticationDTO } from '../shared/models/authentication.model';
import { Player, PlayerBase, PlayerMonitored } from '../shared/models/player.model';
import { toThousandsString, numberWithCommas, isJSON } from '../../../[utils]/utils';
import { PlayerInfoType } from '../shared/models/player-info.type';
import { Weapons } from '../../../weapons/src/shared/models/weapon.model';

const cachedPlayerProperties: string[] = [];
const authenticatedPlayers: Map<number, PlayerMonitored> = new Map();

onNet('authentication:authenticate', (data: authenticationDTO) => {
  const target: number = source;
  setImmediate(async () => {
    const hashedPassword: string = await whirlpool(getHashPasswordWithSalt(data.password, data.email));

    if (!data.isAuthenticating) {
      try {
        const result: Player = await global.exports['oxmysql'].insert_async(
          'INSERT INTO `players`(`name`, `password`, `email`) VALUES (?, ?, ?)', [GetPlayerName(target), hashedPassword, data.email]
        );

        if (result) {
          AuthenticatePlayer(target, result);
        } else {
          throw new Error();
        }
      }
      catch (error) {
        TriggerClientEvent('authentication:register-error', target, 'Registration failed - that email already exists.');
      }
    } else {
      const result: Player = await global.exports['oxmysql'].single_async(
        'SELECT * FROM `players` WHERE email=? AND password=?', [data.email, hashedPassword]
      );

      if (result) {
        AuthenticatePlayer(target, result);
      } else {
        TriggerClientEvent('authentication:login-error', target, 'Authentication failed - incorrect email and password combination.');
      }
    }
  });
})

function getHashPasswordWithSalt(password: string, email: string): string {
  return email.slice(0, 3) + password + email.slice(3, 6);
}

function setPlayerInfo(source: number, stat: string, _value: PlayerInfoType, ignoreSQLCommand: boolean = true, ...additionalValues: { stat: string, _value: PlayerInfoType }[]): void {
  let value = _value;

  if (Array.isArray(_value) || typeof(_value) === 'object') {
    value = JSON.stringify(_value);
  }
  
  if (stat === 'cash') {
    global.exports['armoury-overlay'].updateItem(source, { id: stat, icon: 'attach_money', value: '$' + (Math.abs(<number>value) < 1000 ? numberWithCommas(<number>value) : toThousandsString(<number>value, 2)) });

    const previousValue: number = getPlayerInfo(source, 'cash');
    const difference: number = Number(value) - Number(previousValue || 0);
    if (difference !== 0 && previousValue !== 0) {
      global.exports['armoury-overlay'].showMoneyGainOverlay(source, difference);
    }
  }

  if (stat === 'bank') {
    global.exports['armoury-overlay'].updateItem(source, { id: stat, icon: 'account_balance', value: '$' + (Math.abs(<number>value) < 1000 ? numberWithCommas(<number>value) : toThousandsString(<number>value, 2)) });
  }

  SetConvarReplicated(`${source}_PI_${stat}`, value.toString());

  if (!ignoreSQLCommand) {
    let statsString: string = `${stat} = ?`;
    additionalValues.forEach((additionalValue) => {
      statsString += `, ${additionalValue.stat} = ?`
    });

    global.exports['oxmysql'].update_async(
      `UPDATE \`players\` SET ${statsString} WHERE id = ?`,
      [
        value,
        ...additionalValues.map((additionalValue) => (Array.isArray(additionalValue._value) || typeof(additionalValue._value) === 'object') ? JSON.stringify(additionalValue._value) : additionalValue._value),
        getPlayerInfo(source, 'id')
      ]
    );
  }
}

function getPlayerInfo<T extends PlayerInfoType>(source: number, stat: string): T {
  let value: PlayerInfoType = GetConvar(`${source}_PI_${stat}`, '-1');

  if (isJSON(value.toString())) {
    value = JSON.parse(value, function(_k, v) { return (typeof v === "object" || isNaN(v)) ? v : Number(v); });
  }

  if (stat === 'hoursPlayed') {
    const computedHoursPlayed: number = Number(value) + computeHoursPlayed(source);
    setPlayerInfo(source, stat, computedHoursPlayed);

    return <T> computedHoursPlayed;
  }
  
  return <T> value;
}

function clearPlayerInfo(source: number): void {
  cachedPlayerProperties.forEach((property: string) => {
    SetConvarReplicated(`${source}_PI_${property}`, '-1');
  });
}

function computeHoursPlayed(source: number): number {
  let computedHoursPlayed: number = 0;
  if (authenticatedPlayers.has(source)) {
    computedHoursPlayed = Math.floor(Math.abs(authenticatedPlayers.get(source).lastHoursPlayedCheck.getTime() - new Date().getTime()) / (1000 * 60) % 60) * 0.017;
    authenticatedPlayers.set(source, { ...authenticatedPlayers.get(source), lastHoursPlayedCheck: new Date() });
  }

  return computedHoursPlayed;
}

function getAuthenticatedPlayers() {
  return Array.from(authenticatedPlayers.keys());
}

exports('getPlayerInfo', getPlayerInfo);
exports('setPlayerInfo', setPlayerInfo);
exports('getAuthenticatedPlayers', getAuthenticatedPlayers)

const AuthenticatePlayer = (target: number, stats: Player) => {
  /* Set up overlays */
  global.exports['armoury-overlay'].updateItem(target, { id: 'cash', icon: 'attach_money', value: '$0' });
  global.exports['armoury-overlay'].updateItem(target, { id: 'bank', icon: 'account_balance', value: '$0' });
  global.exports['armoury-overlay'].updateItem(target, { id: 'level', icon: 'hourglass_bottom', value: 'Level 1' });
  global.exports['armoury-overlay'].updateItem(target, { id: 'hunger', icon: 'lunch_dining', value: '100%' });
  global.exports['armoury-overlay'].updateItem(target, { id: 'thirst', icon: 'water_drop', value: '100%' });
  global.exports['armoury-overlay'].updateItem(target, { id: 'mic', icon: 'mic', value: '100%' });

  for (var property in stats) {
    if (stats.hasOwnProperty(property)) {
      setPlayerInfo(target, property, stats[property]);
      if (cachedPlayerProperties.indexOf(property) === -1) {
        cachedPlayerProperties.push(property);
      }
    }
  }

  authenticatedPlayers.set(target, { ...<PlayerMonitored>(<PlayerBase>stats), lastHoursPlayedCheck: new Date() });
  TriggerClientEvent('authentication:success', target, 'test');
  emit('authentication:player-authenticated', target, stats);
}

function savePlayerCriticalStats(player: number): void {
  if (authenticatedPlayers.has(player)) {
    // Saves critical and/or frequently-updated data into MySQL Database
    setPlayerInfo(
      player,
      'hoursPlayed',
      Number(getPlayerInfo(player, 'hoursPlayed')),
      false,
      { stat: 'cash', _value: Number(getPlayerInfo(player, 'cash')) },
      { stat: 'bank', _value: Number(getPlayerInfo(player, 'bank')) },
      { stat: 'weapons', _value: getPlayerInfo(player, 'weapons') }
    );
    authenticatedPlayers.delete(player);
  }
}

onNet('onResourceStop', (resourceName: string) => {
  if (resourceName === GetCurrentResourceName()) {
    Array.from(authenticatedPlayers.keys()).forEach((player: number) => {
      savePlayerCriticalStats(player);
    });

    authenticatedPlayers.clear();
  }
});

on('playerDropped', (_reason: string) => {
  savePlayerCriticalStats(source);
  emit('authentication:player-logout', source);
  clearPlayerInfo(global.source);
})
