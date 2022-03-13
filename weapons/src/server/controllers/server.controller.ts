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

        this.updatePedWeapons(playerId);
    }

    public removePlayerWeapons(playerId: number): void {
        const playerWeapons: Weapon[] = [];
        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', playerWeapons, false);
        RemoveAllPedWeapons(GetPlayerPed(playerId), true);
    }

    public getPlayerWeapons(playerId: number): Weapon[] {
        let playerWeapons: Weapon[] = global.exports['authentication'].getPlayerInfo(playerId, 'weapons');
        
        if (!Array.isArray(playerWeapons)) {
            playerWeapons = [];
        }

        return playerWeapons;
    }

    public updatePedWeapons(playerId: number): void {
        let playerWeapons: Weapons = this.getPlayerWeapons(playerId);

        RemoveAllPedWeapons(GetPlayerPed(playerId), true);

        for (let weapon in playerWeapons) {
            const _weapon: number = Number(weapon);
            
            GiveWeaponToPed(GetPlayerPed(playerId), WeaponHash[_weapon], playerWeapons[weapon], false, false);
            const informatiiDespreArmaRespectiva: Weapon = playerWeapons[weapon];
        }
            GiveWeaponToPed(GetPlayerPed(playerId), WeaponHash[_weapon]], _weapon.ammo, false, false);
        
    }

    private assignExports(): void {
        exports('givePlayerWeapon', this.givePlayerWeapon.bind(this));
        exports('removePlayerWeapons', this.removePlayerWeapons.bind(this));
        exports('getPlayerWeapons', this.getPlayerWeapons.bind(this));
        exports('updatePedWeapons', this.updatePedWeapons.bind(this));
    }
}
