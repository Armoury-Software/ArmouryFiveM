import { EventListener, Export, FiveMController } from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

import { Weapons } from '@shared/models/weapon.model';
import { WeaponHash } from 'fivem-js';

@FiveMController()
export class Server extends ServerController {
  @EventListener({
    eventName: `inventory:player-accepted-trade`
  })
  public onPlayerAcceptedTrade(
    offeredPlayerId: number,
    _offererPlayerId: number
  ): void {
    const itemsToBeReceived =
      global.exports['inventory'].getPendingItemsToBeReceivedByPlayer(offeredPlayerId);

    const piKeysToConsider: string[] = ['weapons'];

    itemsToBeReceived.forEach((item) => {
      if (piKeysToConsider.includes(item._piKey)) {
        global.exports['inventory'].givePlayerItem(offeredPlayerId, item, item._svAmount);
        this.givePlayerWeapon(offeredPlayerId, item.image, item._svAmount);
      }
    });

    global.exports['inventory'].removePendingItemToBeReceivedByPlayer(
      offeredPlayerId,
      ...piKeysToConsider
    );
  }

  @EventListener({
    eventName: `inventory:player-trade-item-given`
  })
  public onPlayerBeganTrade(offererPlayerId: number, offeredPlayerId: number, item: any): void {
    const itemsBeingTransfered = global.exports['inventory'].getTradeRequestsItemsBetweenPlayers(offererPlayerId, offeredPlayerId);
    
    if (!WeaponHash[item.image]) {
      return;
    }

    if (!itemsBeingTransfered.find((_item) => _item._svAmount === item._svAmount)) {
      console.error(`Rejected acknowledgement of trade with ${GetPlayerName(offeredPlayerId)} (#${offeredPlayerId}) as receiver. (Weapons)`);
      return;
    }

    console.log(
      global.exports['authentication'].getPlayerInfo(
        offererPlayerId,
        'weapons'
      )[WeaponHash[item.image]].ammo - item._svAmount
    );

    SetPedAmmo(
      GetPlayerPed(offererPlayerId),
      WeaponHash[item.image],
      global.exports['authentication'].getPlayerInfo(
        offererPlayerId,
        'weapons'
      )[WeaponHash[item.image]].ammo - item._svAmount
    );
  }

  @EventListener()
  public onPlayerAuthenticate(playerId: number): void {
    setTimeout(() => { this.loadPlayerWeapons(playerId) }, 1000);
  }

  @EventListener()
  public onPlayerDeath(): void {
    this.removePlayerWeapons(source);
  }

  @Export()
  public givePlayerWeapon(playerId: number, weapon: string | number, ammo: number): void {
    const currentPlayerWeapons: Weapons = this.getPlayerWeapons(playerId);

    if (typeof weapon === 'string') {
      weapon = WeaponHash[weapon];
    }

    if (!currentPlayerWeapons[weapon]) {
      currentPlayerWeapons[weapon] = { ammo };
    } else {
      currentPlayerWeapons[weapon] = { ...currentPlayerWeapons[weapon], ammo: ammo + currentPlayerWeapons[weapon].ammo }
    }

    global.exports['authentication'].setPlayerInfo(playerId, 'weapons', currentPlayerWeapons, false);

    GiveWeaponToPed(GetPlayerPed(playerId), Number(weapon), ammo, false, false);
  }

  @Export()
  public removePlayerWeapons(playerId: number): void {
    global.exports['authentication'].setPlayerInfo(playerId, 'weapons', {}, false);
    RemoveAllPedWeapons(GetPlayerPed(playerId), true);
  }

  @Export()
  public getPlayerWeapons(playerId: number): Weapons {
    return typeof (global.exports['authentication'].getPlayerInfo(playerId, 'weapons')) === 'object' ? <Weapons>global.exports['authentication'].getPlayerInfo(playerId, 'weapons') : {};
  }

  @Export()
  public loadPlayerWeapons(playerId: number): void {
    const playerWeapons: Weapons = this.getPlayerWeapons(playerId);
    for (let weapon in playerWeapons) {
      GiveWeaponToPed(GetPlayerPed(playerId), Number(weapon), playerWeapons[weapon].ammo, false, false);
    }
  }
}
