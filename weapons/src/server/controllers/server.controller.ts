import { Weapons } from '../../shared/models/weapon.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { WEAPON_NAMES } from '../../shared/weapon';

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
        
        this.updatePedWeapons(playerId, weapon, ammo);
    }

    public removePlayerWeapons(playerId: number): void {
        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', {});
        RemoveAllPedWeapons(GetPlayerPed(playerId), true);
    }

    public getPlayerWeapons(playerId: number): Weapons {
        return typeof(global.exports['authentication'].getPlayerInfo(playerId, 'weapons')) === 'object' ? <Weapons>global.exports['authentication'].getPlayerInfo(playerId, 'weapons') : {};
    }

    public updatePedWeapons(playerId: number, weapon?: string, ammo?: number): void {
        if (weapon) {
            GiveWeaponToPed(GetPlayerPed(playerId), weapon, ammo, false, false);
            return;
        }
        
        const playerWeapons: Weapons = this.getPlayerWeapons(playerId);
        for (let __weapon in playerWeapons) {
            const _weapon: number = Number(__weapon);
            const _weaponAmmo: number = playerWeapons[_weapon].ammo;
            GiveWeaponToPed(GetPlayerPed(playerId), _weapon, _weaponAmmo, false, false);
        }
    }

    private assignExports(): void {
        exports('givePlayerWeapon', this.givePlayerWeapon.bind(this));
        exports('removePlayerWeapons', this.removePlayerWeapons.bind(this));
        exports('getPlayerWeapons', this.getPlayerWeapons.bind(this));
        exports('updatePedWeapons', this.updatePedWeapons.bind(this));
    }

    public assignListeners(): void {
        onNet("authentication:player-authenticated", (source: number) => {
            this.updatePedWeapons(source);
        });

        on('CEventGunShot', (source: number) => {
            const weaponUsed: number = GetSelectedPedWeapon(GetPlayerPed(source));
            let weapons: Weapons = global.exports['authentication'].getPlayerInfo(source, 'weapons');
            weapons[weaponUsed].ammo -= 1;
            global.exports['authentication'].setPlayerInfo(source, 'weapons', weapons);
        });
    }
}
