import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

import { Pet, PetExtended, PetUIModel } from '@shared/models/pet.interface';
import { PETS_DEFAULTS } from '@shared/pets.defaults';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerController {
  private _pets: Map<number, PetExtended> = new Map();
  protected get pets(): Map<number, PetExtended> {
    return this._pets;
  }

  @Export()
  public createPet(pet: Pet, virtualWorld: number): void {
    this._pets.set(virtualWorld, pet);
  }

  @Export()
  public removePet(virtualWorld: number): void {
    if (this._pets.has(virtualWorld)) {
      this._pets.delete(virtualWorld);
    }
  }

  @Export()
  public spawnPetForPlayerInVirtualWorld(
    playerId: number,
    virtualWorld: number,
    spawnPosition: number[],
    isOwner?: boolean,
    ownerPedNetworkId?: number
  ): void {
    if (this._pets.has(virtualWorld)) {
      const petComputed: PetExtended = this._pets.get(virtualWorld);

      TriggerClientEvent(
        `${GetCurrentResourceName()}:create-pet-for-player`,
        playerId,
        petComputed,
        spawnPosition,
        isOwner || false,
        ownerPedNetworkId
      );
    }
  }

  @Export()
  public despawnPetForPlayers(players: number[]): void {
    if (players.length) {
      players.forEach((playerId: number) => {
        TriggerClientEvent(
          `${GetCurrentResourceName()}:destroy-pets-for-player`,
          playerId
        );
      });
    }
  }

  @Export()
  public despawnPetsForPlayer(playerId: number): void {
    TriggerClientEvent(
      `${GetCurrentResourceName()}:destroy-pets-for-player`,
      playerId
    );
  }

  @Export()
  public getPetForVirtualWorld(virtualWorld: number): PetExtended {
    return this._pets.has(virtualWorld) ? this._pets.get(virtualWorld) : null;
  }

  @Export()
  public getPetsForUI<T>(): Required<PetUIModel>[] {
    return Object.keys(PETS_DEFAULTS).map((petKey: string) => ({
      title: this.translate(PETS_DEFAULTS[petKey].title),
      key: petKey,
      image: petKey.split('_').slice(2, 3)[0].toString(),
      [this.translate('friendliness')]: PETS_DEFAULTS[petKey].friendliness,
      [this.translate('affection')]: PETS_DEFAULTS[petKey].affection,
      [this.translate('protection')]: PETS_DEFAULTS[petKey].protection,
      [this.translate('price')]: this.computePrice(
        Number(PETS_DEFAULTS[petKey].price)
      ),
    }));
  }

  @Export()
  public getPetById(id: string): Pet | null {
    if (PETS_DEFAULTS[id]) {
      return <Pet>{
        ...PETS_DEFAULTS[id],
        price: this.computePrice(Number(PETS_DEFAULTS[id].price)),
        key: id,
      };
    }

    return null;
  }

  @Export()
  public getPetNiceNameById(id: string): string {
    if (PETS_DEFAULTS[id]) {
      return this.translate(PETS_DEFAULTS[id].title);
    }

    return '';
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:sync-greet-with-others`,
  })
  public onShouldSyncPetGreetWithOthers(others: number[]): void {
    others.forEach((otherPlayerId: number) => {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:make-pet-greet-player`,
        otherPlayerId,
        false,
        NetworkGetNetworkIdFromEntity(GetPlayerPed(source))
      );
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:sync-pet-follow-with-others`,
  })
  public onShouldSyncPetFollowWithOthers(others: number[]): void {
    others.forEach((otherPlayerId: number) => {
      TriggerClientEvent(
        `${GetCurrentResourceName()}:make-pet-follow-player`,
        otherPlayerId,
        false,
        NetworkGetNetworkIdFromEntity(GetPlayerPed(source))
      );
    });
  }

  private computePrice(priceRate: number): number {
    return Math.floor(
      priceRate *
      /* TODO: Replace with price of most expensive car here */ 10000000
    );
  }
}
