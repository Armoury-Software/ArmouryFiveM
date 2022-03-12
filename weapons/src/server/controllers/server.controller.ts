import { Weapon } from '../../shared/models/weapon.model';
import { ServerController } from '../../../../[utils]/server/server.controller';
import { WeaponHash } from 'fivem-js';

export class Server extends ServerController {
    public constructor(){
        super();

        this.assignExports();
    }

    public givePlayerWeapon(playerId: number, weapon: string, ammo: number): void {
        const currentPlayerWeapons: Weapon[] = this.getPlayerWeapons(playerId);

        if (!currentPlayerWeapons.find((_weapon: Weapon) => _weapon.name === weapon)) {
            currentPlayerWeapons.push({ name: weapon, ammo });
        }

        const updatedPlayerSkills: Weapon[] = currentPlayerWeapons.map((_weapon: Weapon) => _weapon.name === weapon ? { ..._weapon, ammo } : { ..._weapon, value: _weapon.ammo });
        global.exports['authentication'].setPlayerInfo(playerId, 'weapons', updatedPlayerSkills, false);

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
        let playerWeapons: Weapon[] = this.getPlayerWeapons(playerId);

        RemoveAllPedWeapons(GetPlayerPed(playerId), true);

        playerWeapons.forEach((_weapon: Weapon) => {
            GiveWeaponToPed(GetPlayerPed(playerId), WeaponHash[_weapon.name], _weapon.ammo, false, false);
        })
    }

    private assignExports(): void {
        exports('givePlayerWeapon', this.givePlayerWeapon.bind(this));
        exports('removePlayerWeapons', this.removePlayerWeapons.bind(this));
        exports('getPlayerWeapons', this.getPlayerWeapons.bind(this));
        exports('updatePedWeapons', this.updatePedWeapons.bind(this));
    }
}
