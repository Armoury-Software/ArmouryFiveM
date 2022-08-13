import { ClientController } from '@core/client/client.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';

import { PetExtended } from '@shared/models/pet.interface';

@FiveMController()
export class Client extends ClientController {
  private _spawnedPetsInVirtualWorlds: number[] = [];
  protected get spawnedPetsInVirtualWorlds(): number[] {
    return this._spawnedPetsInVirtualWorlds;
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:create-pet-for-player`,
  })
  public onPetShouldBeCreated(
    pet: PetExtended,
    spawnPosition: number[],
    isOwner?: boolean,
    ownerPedNetworkId?: number
  ): void {
    this.createPedAsync(
      0,
      GetHashKey(pet.pedId),
      spawnPosition[0],
      spawnPosition[1],
      spawnPosition[2],
      spawnPosition[3],
      false,
      false
    ).then((pedId: number) => {
      this._spawnedPetsInVirtualWorlds.push(pedId);

      if (isOwner) {
        setTimeout(() => {
          this.makePetGreetPlayer(true);

          setTimeout(() => {
            this.makePetFollowPlayer(true);
          }, 3000);
        }, 1000);
      } else if (!isNaN(ownerPedNetworkId) && ownerPedNetworkId > -1) {
        setTimeout(() => {
          const ownerPedId: number =
            NetworkGetEntityFromNetworkId(ownerPedNetworkId);

          if (ownerPedId) {
            const ownerPedCoords: number[] = GetEntityCoords(ownerPedId, true);
            SetEntityCoords(
              pedId,
              ownerPedCoords[0],
              ownerPedCoords[1],
              ownerPedCoords[2] + 0.25,
              true,
              false,
              false,
              false
            );
            this.makePetFollowPlayer(false, ownerPedNetworkId);
          }
        }, 1500);
      } else {
        this.playAnimForPed(
          pedId,
          'creatures@rottweiler@amb@sleep_in_kennel@',
          'sleep_in_kennel',
          -1,
          1
        );
      }
    });
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:destroy-pets-for-player`,
  })
  public onPetsShouldBeDestroyed(
    pet?: PetExtended,
    virtualWorld?: number
  ): void {
    this._spawnedPetsInVirtualWorlds.forEach((pedId: number) => {
      DeleteEntity(pedId);
    });

    this._spawnedPetsInVirtualWorlds = [];
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:make-pet-greet-player`,
  })
  private makePetGreetPlayer(
    sync?: boolean,
    playerPedNetworkId?: number
  ): void {
    TaskGoToEntity(
      this._spawnedPetsInVirtualWorlds[0],
      playerPedNetworkId
        ? NetworkGetEntityFromNetworkId(playerPedNetworkId)
        : PlayerPedId(),
      6000,
      2.0,
      4.0,
      1073741824,
      0
    );
    TaskLookAtEntity(
      this._spawnedPetsInVirtualWorlds[0],
      playerPedNetworkId
        ? NetworkGetEntityFromNetworkId(playerPedNetworkId)
        : PlayerPedId(),
      -1,
      2048,
      3
    );

    if (sync) {
      const activePlayers: number[] = GetActivePlayers();
      const playersToExecuteAction: number[] = [];
      activePlayers.forEach((activePlayer: number) => {
        if (activePlayer !== 128) {
          const playerServerId: number = GetPlayerServerId(activePlayer);

          if (
            this.getPlayerInfo('virtualWorld', playerServerId) ===
            this.getPlayerInfo('virtualWorld')
          ) {
            playersToExecuteAction.push(playerServerId);
          }
        }
      });

      if (playersToExecuteAction.length) {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:sync-greet-with-others`,
          playersToExecuteAction
        );
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:make-pet-follow-player`,
  })
  private makePetFollowPlayer(
    sync?: boolean,
    playerPedNetworkId?: number
  ): void {
    TaskFollowToOffsetOfEntity(
      this._spawnedPetsInVirtualWorlds[0],
      playerPedNetworkId
        ? NetworkGetEntityFromNetworkId(playerPedNetworkId)
        : PlayerPedId(),
      0.0,
      0.0,
      0.5,
      2.0,
      -1,
      10.0,
      true
    );

    if (sync) {
      const activePlayers: number[] = GetActivePlayers();
      const playersToExecuteAction: number[] = [];
      activePlayers.forEach((activePlayer: number) => {
        if (activePlayer !== 128) {
          const playerServerId: number = GetPlayerServerId(activePlayer);

          if (
            this.getPlayerInfo('virtualWorld', playerServerId) ===
            this.getPlayerInfo('virtualWorld')
          ) {
            playersToExecuteAction.push(playerServerId);
          }
        }
      });

      if (playersToExecuteAction.length) {
        TriggerServerEvent(
          `${GetCurrentResourceName()}:sync-pet-follow-with-others`,
          playersToExecuteAction
        );
      }
    }
  }
}
