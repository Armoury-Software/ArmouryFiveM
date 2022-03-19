import { JAIL_POSITIONS, JAIL_TIME, UNJAIL_POSTION } from '../../shared/jail';
import { ServerController } from '../../../../[utils]/server/server.controller';

export class Server extends ServerController {
    public constructor() {
        super();

        this.assignTimers();
        this.registerExports();
        this.assignListeners();
    }
    private jailedPlayers: Map<number, number> = new Map<number, number>();

    private jailPlayer(target: number): void {
        let jailTime: number;
        if (global.exports.getPlayerInfo(target, 'jailTime')) {
            jailTime = global.exports.getPlayerInfo(target, 'jailTime');
        } else {
            jailTime = JAIL_TIME*global.exports['authentication'].getPlayerInfo(target, 'wantedLevel')
        }
        this.jailedPlayers.set(target, jailTime);
        const jailPosition: number[] = JAIL_POSITIONS[Math.floor(Math.random()*JAIL_POSITIONS.length)].pos;
        SetEntityCoords(GetPlayerPed(target), jailPosition[0], jailPosition[1], jailPosition[2], true, false, false, false);
        global.exports['authentication'].setPlayerInfo(target, 'wantedLevel', 0);
    }
    
    private unJailPlayer(target: number): void {
        this.jailedPlayers.delete(target);
        global.exports['autentication'].setPlayerInfo(target, 'jailTime', 0);
        SetEntityCoords(GetPlayerPed(target), UNJAIL_POSTION[0], UNJAIL_POSTION[1], UNJAIL_POSTION[2], true, false, false, false);
    }

    private assignTimers(): void {
        setInterval(() => {
            Array.from(this.jailedPlayers.keys()).forEach(
                (target: number) => {
                    TriggerClientEvent(`${GetCurrentResourceName()}:update-ui`, target, this.jailedPlayers.get(target));
                    this.jailedPlayers.set(target, this.jailedPlayers.get(target) - 1);
                    if (this.jailedPlayers.get(target) === 0) {
                        this.unJailPlayer(target);
                    }
                }
            )
        }, 1000);
    }

    private assignListeners(): void {
        on('authentication:player-authenticated',
        (target: number) => {
            if (global.exports.getPlayerInfo(target, 'jailTime') > 0) {
                this.jailPlayer(target);
            }
        })
        on('playerDropped', (_reason: string) => {
            if (this.jailedPlayers.has(source)) {
                global.exports['authentication'].setPlayerInfo(source, 'jailTime', this.jailedPlayers.get(source));
                this.jailedPlayers.delete(source);
            }
        })
    }

    private registerExports(): void {
        exports('jailPlayer', this.jailPlayer.bind(this));
        exports('unJailPlayer', this.unJailPlayer.bind(this));
    }
}
