import { Weapons } from '../../shared/models/weapon.model';
import { ServerController } from '../../../../[utils]/server/server.controller';

export class Server extends ServerController {
    public constructor(){
        super();

        this.assignExports();
        this.assignListeners();
    }

    public givePlayerWeapon(playerId: number, weapon: string, ammo: number): void {
        const currentPlayerWeapons: Weapons = this.getPlayerWeapons(playerId);

        if (!currentPlayerWeapons[weapon]) {
            currentPlayerWeapons[weapon] = { ammo };
        } else {
            currentPlayerWeapons[weapon] = { ...currentPlayerWeapons[weapon], ammo: ammo + currentPlayerWeapons[weapon].ammo }
        }

        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', currentPlayerWeapons);

        GiveWeaponToPed(GetPlayerPed(playerId), Number(weapon), ammo, false, false);
    }

    public removePlayerWeapons(playerId: number): void {
        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', {});
        RemoveAllPedWeapons(GetPlayerPed(playerId), true);
    }

    public getPlayerWeapons(playerId: number): Weapons {
        return typeof(global.exports['authentication'].getPlayerInfo(playerId, 'weapons')) === 'object' ? <Weapons>global.exports['authentication'].getPlayerInfo(playerId, 'weapons') : {};
    }

    public loadPlayerWeapons(playerId: number): void {
        const playerWeapons: Weapons = this.getPlayerWeapons(playerId);
        for (let weapon in playerWeapons) {
            GiveWeaponToPed(GetPlayerPed(playerId), Number(weapon), playerWeapons[weapon].ammo, false, false);
        }
    }

    private assignExports(): void {
        exports('givePlayerWeapon', this.givePlayerWeapon.bind(this));
        exports('removePlayerWeapons', this.removePlayerWeapons.bind(this));
        exports('getPlayerWeapons', this.getPlayerWeapons.bind(this));
        exports('loadPlayerWeapons', this.loadPlayerWeapons.bind(this));
    }

    public assignListeners(): void {
        onNet("authentication:player-authenticated", (source: number) => {
            setTimeout(() => { this.loadPlayerWeapons(source) }, 1000);
        });

        onNet("armoury:onPlayerDeath", () => {
            this.removePlayerWeapons(source);
        });
    }
}
