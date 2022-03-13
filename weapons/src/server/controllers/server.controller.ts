import { Weapon, Weapons } from '../../shared/models/weapon.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { WeaponHash } from 'fivem-js';

export class Server extends ServerController {
    public constructor(){
        super();

        this.assignExports();
    }

    public givePlayerWeapon(playerId: number, weapon: string, ammo: number): void {
        const currentPlayerWeapons: Weapons = this.getPlayerWeapons(playerId);

        if (!currentPlayerWeapons[weapon]) {
            currentPlayerWeapons[weapon] = { ammo };
        } else {
            currentPlayerWeapons[weapon] = { ...currentPlayerWeapons[weapon], ammo: ammo + currentPlayerWeapons[weapon].ammo }
        }

        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', currentPlayerWeapons, false);
        
        this.updatePedWeapons(playerId, weapon, ammo);
    }

    public removePlayerWeapons(playerId: number): void {
        const playerWeapons: Weapon[] = [];
        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', playerWeapons);
        RemoveAllPedWeapons(GetPlayerPed(playerId), true);
    }

    public getPlayerWeapons(playerId: number): Weapons {
        return global.exports['authentication'].getPlayerInfo(playerId, 'weapons');
    }

    public updatePedWeapons(playerId: number, weapon?: string, ammo?: number): void {
        if (weapon) {
            GiveWeaponToPed(GetPlayerPed(playerId), WeaponHash[weapon], ammo, false, false);
            return;
        }
        
        let playerWeapons: Weapons = this.getPlayerWeapons(playerId);

        RemoveAllPedWeapons(GetPlayerPed(playerId), true);

        for (let weapon in playerWeapons) {
            const _weapon: number = Number(weapon);
            const _weaponAmmo: number = playerWeapons[_weapon].ammo;
            GiveWeaponToPed(GetPlayerPed(playerId), WeaponHash[_weapon], _weaponAmmo, false, false);
        }
        
    }

    private assignExports(): void {
        exports('givePlayerWeapon', this.givePlayerWeapon.bind(this));
        exports('removePlayerWeapons', this.removePlayerWeapons.bind(this));
        exports('getPlayerWeapons', this.getPlayerWeapons.bind(this));
        exports('updatePedWeapons', this.updatePedWeapons.bind(this));
    }
}
