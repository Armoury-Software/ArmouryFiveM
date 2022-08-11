import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerController } from '@core/server/server.controller';

import { Pet, PetExtended } from '@shared/models/pet.interface';

@FiveMController()
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
}
