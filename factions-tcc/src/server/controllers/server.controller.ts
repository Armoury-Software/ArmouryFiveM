import {
  Command,
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerFactionController } from '@core/server/server-faction.controller';
import { ItemConstructor } from '../../../../inventory/src/shared/helpers/inventory-item.constructor';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Server extends ServerFactionController {
  private towCalls: Map<
    number,
    { originalX: number; originalY: number; originalZ: number; range: number }
  > = new Map();
  private tccMembersWithCalls: Map<
    number,
    {
      vehicleNetworkId: number;
      originalX: number;
      originalY: number;
      originalZ: number;
      range: number;
      step: TOW_STEP;
    }
  > = new Map();

  public constructor() {
    super();

    this.registerVehicleKeyLockerPosition([
      1101.320068359375, -3097.118408203125, -38.99998092651367,
    ]);

    this.registerVehicles(
      [0, 0],
      {
        modelHash: GetHashKey('towtruck'),
        pos: [
          923.441162109375, -1523.8662109375, 31.001834869384766,
          -0.7611671090126038, 0.6513330936431885, 176.1492919921875,
          176.14923095703125,
        ],
      },
      {
        modelHash: GetHashKey('towtruck'),
        pos: [
          902.74462890625, -1541.8975830078125, 30.465152740478516,
          -0.009909444488584995, 0.052126992493867874, -141.9612274169922,
          218.03875732421875,
        ],
      },
      {
        modelHash: GetHashKey('towtruck'),
        pos: [
          896.311767578125, -1547.09716796875, 30.470924377441406,
          0.8747822046279907, -0.3181564211845398, -140.31594848632812,
          219.68887329101562,
        ],
      },
      {
        modelHash: GetHashKey('towtruck'),
        pos: [
          891.1858520507812, -1551.4765625, 30.598724365234375,
          0.4968984127044678, -0.7059294581413269, -139.27999877929688,
          220.72152709960938,
        ],
      },
      {
        modelHash: GetHashKey('towtruck2'),
        pos: [
          878.7880249023438, -1527.601806640625, 29.807415008544922,
          -0.7340973615646362, -0.12145823240280151, -141.07887268066406,
          218.92274475097656,
        ],
      },
      {
        modelHash: GetHashKey('towtruck2'),
        pos: [
          873.7713012695312, -1531.8126220703125, 29.810823440551758,
          -0.3842659890651703, -0.28651565313339233, -141.7305908203125,
          218.26895141601562,
        ],
      }
    );

    this.registerClothingLockerPositions([
      1103.610595703125, -3097.47802734375, -38.99998092651367,
    ]);

    this.registerClothingLockerItems(
      ...ItemConstructor.bundle(
        new ItemConstructor(
          this.getLockerItems.bind(this),
          'clothings',
          undefined,
          this.translationLanguage
        ).get()
      )
    );
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:add-to-pending-tow-calls`,
  })
  public onVehicleAddedToPendingCalls(
    ...vehicles: {
      vehicleNetworkId: number;
      originalX: number;
      originalY: number;
      originalZ: number;
      range: number;
    }[]
  ): void {
    vehicles.forEach((vehicle) => {
      this.towCalls.set(vehicle.vehicleNetworkId, {
        originalX: vehicle.originalX,
        originalY: vehicle.originalY,
        originalZ: vehicle.originalZ,
        range: vehicle.range,
      });
    });

    global.exports['factions']
      .getOnlineFactionMembers(this.factionInternalId)
      .forEach((member) => {
        this.updateTowCallsMessageFor(member.onlineId);
      });
  }

  @EventListener()
  public onPlayerAuthenticate(playerId: number, player: any): void {
    super.onPlayerAuthenticate(playerId, player);

    if (this.towCalls.size && this.isPlayerMemberOfThisFaction(playerId)) {
      this.updateTowCallsMessageFor(playerId);
    }
  }

  @EventListener()
  public onPlayerDisconnect(): void {
    const playerId: number = source;

    if (this.tccMembersWithCalls.has(playerId)) {
      this.tccMembersWithCalls.delete(playerId);
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:tow-delivery-success`,
  })
  public onPlayerTowDeliverySuccess(trailerVehicleNetworkId: number): void {
    const playerId: number = source;
    console.log('reached here! (1)');

    if (
      this.tccMembersWithCalls.has(playerId) &&
      this.tccMembersWithCalls.get(playerId).vehicleNetworkId ===
        trailerVehicleNetworkId
    ) {
      console.log('Tow delivery was a success!');
    }
  }

  @EventListener()
  public onPlayerStartTowVehicle(vehicleBeingTowedNetworkId: number): void {
    const playerId: number = source;

    if (!this.tccMembersWithCalls.has(playerId)) {
      return;
    }

    const call = this.tccMembersWithCalls.get(playerId);

    if (call.vehicleNetworkId === vehicleBeingTowedNetworkId) {
      this.tccMembersWithCalls.set(playerId, {
        ...this.tccMembersWithCalls.get(playerId),
        step: TOW_STEP.TOW_STEP_TOWED,
      });

      TriggerClientEvent(
        `${GetCurrentResourceName()}:set-tow-call-checkpoint`,
        playerId,
        call.originalX,
        call.originalY,
        call.originalZ - 1.0,
        call.range
      );
      TriggerClientEvent(
        `${GetCurrentResourceName()}:remove-tow-call-checkpoint`,
        playerId
      );
    }
  }

  @EventListener()
  public onPlayerStopTowVehicle(): void {
    const playerId: number = source;

    if (!this.tccMembersWithCalls.has(playerId)) {
      return;
    }

    const call = this.tccMembersWithCalls.get(playerId);
    const vehicleEntity: number = NetworkGetEntityFromNetworkId(
      call.vehicleNetworkId
    );
    const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(vehicleEntity, true);

    if (call.step === TOW_STEP.TOW_STEP_TOWED) {
      this.tccMembersWithCalls.set(playerId, {
        ...call,
        step: TOW_STEP.TOW_STEP_PAUSED,
      });

      TriggerClientEvent(
        `${GetCurrentResourceName()}:set-tow-call-checkpoint`,
        playerId,
        vehicleX,
        vehicleY,
        vehicleZ - 1.0
      );
      TriggerClientEvent(
        `${GetCurrentResourceName()}:remove-tow-delivery-checkpoint`,
        playerId
      );
    }
  }

  @EventListener({ eventName: 'inventory:client-receive-item' })
  public onPlayerReceiveItemFromMenu(item): void {
    const playerId: number = source;

    if (
      this.isPlayerAtClothingLocker(playerId) &&
      this.isPlayerMemberOfThisFaction(playerId) &&
      this.clothingLockerItems.find((_item) => _item.image === item.image)
    ) {
      const clothingRank = Number(item.image.charAt(item.image.length - 1));

      if (
        !isNaN(clothingRank) &&
        global.exports['factions'].getFactionMemberRank(
          this.factionInternalId,
          playerId
        ) < clothingRank
      ) {
        return;
      }

      global.exports['inventory'].givePlayerItem(
        playerId,
        item,
        this.getLockerItems()[item.image]
      );
    }
  }

  @EventListener({ eventName: 'inventory:client-give-to-additional-inventory' })
  public onInventoryItemDraggedIntoLocker(item): void {
    const playerId: number = source;

    if (item.image.includes('mechanicsuit')) {
      global.exports['inventory'].consumePlayerItem(playerId, item, 1);
    }
  }

  @Command()
  public tccTakeTowCall(playerId: number): void {
    if (
      !this.towCalls.size ||
      this.tccMembersWithCalls.has(playerId) ||
      !this.isPlayerMemberOfThisFaction(playerId)
    ) {
      return;
    }

    const towCallVehicleNetworkId = Array.from(this.towCalls.keys()).at(0);
    const vehicleEntity: number = NetworkGetEntityFromNetworkId(
      towCallVehicleNetworkId
    );
    const [vehicleX, vehicleY, vehicleZ] = GetEntityCoords(vehicleEntity, true);
    const towCallVehicleInformation = this.towCalls.get(
      towCallVehicleNetworkId
    );

    this.tccMembersWithCalls.set(playerId, {
      vehicleNetworkId: towCallVehicleNetworkId,
      step: TOW_STEP.TOW_STEP_NONE,
      originalX: towCallVehicleInformation.originalX,
      originalY: towCallVehicleInformation.originalY,
      originalZ: towCallVehicleInformation.originalZ - 1.0,
      range: towCallVehicleInformation.range,
    });

    TriggerClientEvent(
      `${GetCurrentResourceName()}:set-tow-call-checkpoint`,
      playerId,
      towCallVehicleNetworkId,
      vehicleX,
      vehicleY,
      vehicleZ - 1.0,
      towCallVehicleInformation.originalX,
      towCallVehicleInformation.originalY,
      towCallVehicleInformation.originalZ - 1.0,
      towCallVehicleInformation.range
    );

    this.removePendingTowCall(towCallVehicleNetworkId);
  }

  private updateTowCallsMessageFor(playerId: number): void {
    global.exports['armoury-overlay'].setMessage(playerId, {
      id: 'tcc-calls-message',
      content: this.translate('tow_calls_pending', {
        number: this.towCalls.size.toString(),
      }),
    });
  }

  private removeTowCallsMessage(): void {
    TriggerClientEvent('armoury-overlay:delete-message', -1, {
      id: 'tcc-calls-message',
    });
  }

  private removePendingTowCall(towCallVehicleNetworkId: number): void {
    this.towCalls.delete(towCallVehicleNetworkId);

    if (!this.towCalls.size) {
      this.removeTowCallsMessage();
    } else {
      global.exports['factions']
        .getOnlineFactionMembers(this.factionInternalId)
        .forEach((member) => {
          this.updateTowCallsMessageFor(member.onlineId);
        });
    }
  }

  private getLockerItems(): object {
    return {
      mechanicsuit: {
        components: {
          3: {
            drawableId: 63,
            textureId: 0,
            paletteId: 0,
          },
          4: {
            drawableId: 89,
            textureId: 21,
            paletteId: 0,
          },
          5: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          6: {
            drawableId: 7,
            textureId: 2,
            paletteId: 0,
          },
          7: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          8: {
            drawableId: 0,
            textureId: 0,
            paletteId: 0,
          },
          11: {
            drawableId: 0,
            textureId: 5,
            paletteId: 0,
          },
          clothingId: 'mechanicsuit',
        },
      },
    };
  }
}

export enum TOW_STEP {
  TOW_STEP_NONE = 0,
  TOW_STEP_TOWED,
  TOW_STEP_PAUSED,
}
