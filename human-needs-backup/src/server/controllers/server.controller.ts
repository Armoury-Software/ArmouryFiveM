import { ServerController } from '@core/server/server.controller';
import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import {
  DECREMENTS_PER_MINUTE,
  ITEM_GAININGS_MAPPINGS,
} from '@shared/constants';

import { i18n } from '../i8n';
import { Player } from '../../../../authentication/src/shared/models/player.model';
import { Item } from '../../../../inventory/src/shared/item-list.model';

@FiveMController({ translationFile: i18n })
export class Server extends ServerController {
  private hungerMap: Map<number, number> = new Map<number, number>();
  private thirstMap: Map<number, number> = new Map<number, number>();

  private intervals: NodeJS.Timer[] = [];

  public constructor() {
    super();

    setTimeout(() => this.loadNeedsMaps(), 1000);
    this.assignIntervals();
  }

  @Export()
  public getPlayerHungerLevel(playerId: number): number {
    if (this.hungerMap.has(playerId)) {
      return this.hungerMap.get(playerId);
    }

    return 100;
  }

  @Export()
  public getPlayerThirstLevel(playerId: number): number {
    if (this.thirstMap.has(playerId)) {
      return this.thirstMap.get(playerId);
    }

    return 100;
  }

  @Export()
  public setPlayerHungerLevel(playerId: number, newHungerLevel: number): void {
    if (this.hungerMap.has(playerId)) {
      this.hungerMap.set(playerId, Math.min(newHungerLevel, 100));

      global.exports['armoury-overlay'].updateItem(playerId, {
        id: 'hunger',
        icon: 'lunch_dining',
        value: `${Math.min(newHungerLevel, 100)}%`,
      });
    }
  }

  @Export()
  public setPlayerThirstLevel(playerId: number, newThirstLevel: number): void {
    if (this.thirstMap.has(playerId)) {
      this.thirstMap.set(playerId, Math.min(newThirstLevel, 100));

      global.exports['armoury-overlay'].updateItem(playerId, {
        id: 'thirst',
        icon: 'water_drop',
        value: `${Math.min(newThirstLevel, 100)}%`,
      });
    }
  }

  @EventListener()
  public onPlayerAuthenticate(
    playerAuthenticated: number,
    player: Player
  ): void {
    this.loadPlayerIntoNeedsMaps(
      playerAuthenticated,
      player.hunger,
      player.thirst
    );
  }

  @EventListener({ eventName: 'inventory:inventory-item-clicked' })
  public onPlayerInventoryItemClicked(itemClickEvent: { item: Item }): void {
    if (ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image]) {
      if (ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image].hungerGain) {
        this.setPlayerHungerLevel(
          source,
          this.getPlayerHungerLevel(source) +
            Number(ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image].hungerGain)
        );
        this.updateHungerThirstMessage(source);
      }

      if (ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image].healthGain) {
        // TODO: Add health
      }

      if (ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image].thirstGain) {
        this.setPlayerThirstLevel(
          source,
          this.getPlayerThirstLevel(source) +
            Number(ITEM_GAININGS_MAPPINGS[itemClickEvent.item.image].thirstGain)
        );
        this.updateHungerThirstMessage(source);
      }

      global.exports['inventory'].consumePlayerItem(
        source,
        itemClickEvent.item,
        1
      );
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    super.onPlayerDisconnect();

    if (this.hungerMap.has(source)) {
      this.hungerMap.delete(source);
    }

    if (this.thirstMap.has(source)) {
      this.thirstMap.delete(source);
    }
  }

  @EventListener()
  public onResourceStop(resourceName: string) {
    if (resourceName === GetCurrentResourceName()) {
      this.clearIntervals();

      Array.from(this.hungerMap.keys()).forEach((playerId: number) => {
        global.exports['authentication'].setPlayerInfo(
          playerId,
          'hunger',
          global.exports['authentication'].getPlayerInfo(playerId, 'hunger')
        );
      });

      Array.from(this.thirstMap.keys()).forEach((playerId: number) => {
        global.exports['authentication'].setPlayerInfo(
          playerId,
          'thirst',
          global.exports['authentication'].getPlayerInfo(playerId, 'thirst')
        );
      });
    }
  }

  private assignIntervals(): void {
    this.intervals.push(
      setInterval(
        this.onHungerDecrement.bind(this),
        Math.floor(60000 / DECREMENTS_PER_MINUTE.hunger)
      ),
      setInterval(
        this.onThirstDecrement.bind(this),
        Math.floor(60000 / DECREMENTS_PER_MINUTE.thirst)
      )
    );
  }

  private clearIntervals(): void {
    this.intervals.forEach((interval: NodeJS.Timer) => {
      clearInterval(interval);
    });
  }

  private onHungerDecrement(): void {
    Array.from(this.hungerMap.keys()).forEach((player: number) => {
      this.decrementHungerForPlayer(player);
    });
  }

  private onThirstDecrement(): void {
    Array.from(this.thirstMap.keys()).forEach((player: number) => {
      this.decrementThirstForPlayer(player);
    });
  }

  private decrementHungerForPlayer(playerId: number): void {
    const playerHungerLevel: number = this.hungerMap.get(playerId);
    this.hungerMap.set(playerId, Math.max(playerHungerLevel - 1, 0));
    this.updateHungerThirstMessage(playerId);

    if (playerHungerLevel === 0) {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:apply-player-damage`,
        playerId,
        5
      );
    }

    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'hunger',
      icon: 'lunch_dining',
      value: `${Math.floor(playerHungerLevel)}%`,
    });
  }

  private decrementThirstForPlayer(playerId: number): void {
    const playerThirstLevel: number = this.thirstMap.get(playerId);
    this.thirstMap.set(playerId, Math.max(playerThirstLevel - 1, 0));
    this.updateHungerThirstMessage(playerId);

    if (playerThirstLevel === 0) {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:apply-player-damage`,
        playerId,
        2.5
      );
    }

    global.exports['armoury-overlay'].updateItem(playerId, {
      id: 'thirst',
      icon: 'water_drop',
      value: `${Math.floor(playerThirstLevel)}%`,
    });
  }

  private loadNeedsMaps(): void {
    global.exports['authentication']
      .getAuthenticatedPlayers()
      .forEach((playerId: number) => {
        this.loadPlayerIntoNeedsMaps(
          playerId,
          global.exports['authentication'].getPlayerInfo(playerId, 'hunger'),
          global.exports['authentication'].getPlayerInfo(playerId, 'thirst')
        );
      });
  }

  private loadPlayerIntoNeedsMaps(
    playerId: number,
    hunger: number,
    thirst: number
  ): void {
    this.hungerMap.set(playerId, hunger == null ? 100 : hunger);
    this.thirstMap.set(playerId, thirst == null ? 100 : thirst);

    this.decrementThirstForPlayer(playerId);
    this.decrementHungerForPlayer(playerId);
  }

  private updateHungerThirstMessage(playerId: number): void {
    if (
      this.getPlayerHungerLevel(playerId) < 20 ||
      this.getPlayerThirstLevel(playerId) < 20
    ) {
      global.exports['armoury-overlay'].setMessage(playerId, {
        id: 'needs-message',
        content:
          this.getPlayerHungerLevel(playerId) < 20 &&
          this.getPlayerThirstLevel(playerId) < 20
            ? this.translate('tooltip_hungry_and_thirsty')
            : this.getPlayerHungerLevel(playerId) < 2
            ? this.translate('tooltip_hungry')
            : this.translate('tooltip_thirsty'),
      });
    } else {
      global.exports['armoury-overlay'].deleteMessage(playerId, {
        id: 'needs-message',
      });
    }
  }
}
