import { authenticationDTO } from '../shared/models/authentication.model';
import { Player } from '../shared/models/player.model';

const cachedPlayerProperties: string[] = [];

onNet('authentication:authenticate', (data: authenticationDTO) => {
    const target: number = source;
    if (!data.isAuthenticating) {
        setImmediate(async () => {
            try {
                const result: Player = await global.exports['oxmysql'].insert_async(
                    'INSERT INTO `players`(`name`, `password`, `email`) VALUES (?, ?, ?)', ['blank atm', data.password, data.email]
                );
    
                if (result) {
                    AssignRecords(target, result);
                    TriggerClientEvent('authentication:success', target, 'test');
                    TriggerServerEvent('authentication:player-authenticated', target);
                } else {
                    throw new Error();
                }
            }
            catch (error) {
                TriggerClientEvent('authentication:register-error', target, 'Registration failed - that email already exists.');
            }
        });
    } else {
        setImmediate(async () => {
            const result: Player = await global.exports['oxmysql'].single_async(
                'SELECT * FROM `players` WHERE email=? AND password=?', [data.email, data.password]
            );

            if (result) {
                AssignRecords(target, result);
                TriggerClientEvent('authentication:success', target, 'test');
                emit('authentication:player-authenticated', target);
            } else {
                TriggerClientEvent('authentication:login-error', target, 'Authentication failed - incorrect email and password combination.');
            }
        });
    }
})

function setPlayerInfo(source: number, stat: string, _value: number | string | number[] | string[], ignoreSQLCommand: boolean = true): void {
    let value = _value;

    if (Array.isArray(_value)) {
        value = _value.join(';ARM;,');
    }
    
    if (stat === 'cash') {
        global.exports['armoury-overlay'].updateItem(source, { id: 'cash', icon: 'attach_money', value });

        const previousValue: number = getPlayerInfo(source, 'cash');
        const difference: number = Number(value) - Number(previousValue || 0);
        if (difference !== 0 && previousValue !== 0) {
            global.exports['armoury-overlay'].showMoneyGainOverlay(source, difference);
        }
    }

    SetConvarReplicated(`${source}_PI_${stat}`, value.toString());

    if (!ignoreSQLCommand) {
        global.exports['oxmysql'].update(`UPDATE \`players\` SET ${stat} = ? WHERE id = ?`, [value, getPlayerInfo(source, 'id')]);
    }
}

function getPlayerInfo<T extends string | number | string[] | number[]>(source: number, stat: string): T {
    let value: string | number | string[] | number[] = GetConvar(`${source}_PI_${stat}`, '-1');
    
    if (value.toString().includes(';ARM;,')) {
        value = value.split(';ARM;,');
    }
    
    return <T> value;
}

function clearPlayerInfo(source: number): void {
    cachedPlayerProperties.forEach((property: string) => {
        SetConvarReplicated(`${source}_PI_${property}`, '-1');
    });
}

exports('getPlayerInfo', getPlayerInfo);
exports('setPlayerInfo', setPlayerInfo);

const AssignRecords = (target: number, stats: Player) => {
    for (var property in stats) {
        if (stats.hasOwnProperty(property)) {
            setPlayerInfo(target, property, stats[property]);
            if (cachedPlayerProperties.indexOf(property) != -1) {
                cachedPlayerProperties.push(property);
            }
        }
    }
}

on('playerDropped', (reason: string) => {
    console.log(`Player ${GetPlayerName(global.source)} dropped (Reason: ${reason}).`);
    clearPlayerInfo(global.source);
})
