import { Command, EventListener, FiveMController } from '@core/decorators/armoury.decorators';

import { ServerController } from './server.controller';
import { FactionVehicle } from './models/faction-vehicle.interface';
import { ItemConstructor } from '../../inventory/src/shared/helpers/inventory-item.constructor';
import { Faction } from '../../factions/src/shared/models/faction.interface';
import { Item } from '../../inventory/src/shared/item-list.model';
import { calculateDistance, isPlayerInRangeOfPoint } from '@core/utils';

@FiveMController()
export class ServerFactionController extends ServerController {
    private _factionInternalId: string = '';
    protected get factionInternalId() {
      return this._factionInternalId;
    }

    private _spawnedVehicles: number[] = [];
    protected get spawnedVehicles() {
      return this._spawnedVehicles;
    }

    private _pendingVehicles: FactionVehicle[] = [];
    protected get pendingVehicles() {
      return this._pendingVehicles;
    }

    private _lockerKeyPosition: number[] = [];
    protected get lockerKeyPosition(): number[] {
      return this._lockerKeyPosition;
    }

    private _maxLockerKeys: number = 2;
    protected get maxLockerKeys(): number {
      return this._maxLockerKeys
    }

    private _lockerKeys: Map<number, number[]> = new Map();
    protected get lockerKeys(): Map<number, number[]> {
      return this._lockerKeys;
    }

    private vehicleSpawnTimeout: NodeJS.Timeout;

    public constructor() {
      super();

      this._assignDefaultListeners();
      this._factionInternalId = GetCurrentResourceName().split('-')[1];

      if (!GetCurrentResourceName().includes('factions-')) {
        console.error('You are using a Faction controller but its name does NOT comply with the naming \'factions-<factionInternalId>\'. The resource may not work properly.');
      }
    }

    protected isPlayerMemberOfThisFaction(playerId: number): boolean {
      return global.exports['factions'].isPlayerMemberOfFaction(this.factionInternalId, playerId)
    }

    protected getFactionMemberRank(playerId: number): number {
      return global.exports['factions'].getFactionMemberRank(this.factionInternalId, playerId);
    }

    protected isVehicleOwnedByThisFaction(vehicleId: number): boolean {
      return this._spawnedVehicles.includes(vehicleId);
    }

    protected openVehicleKeysLockerForPlayer(playerId: number): void {
      emit(
        'inventory:client-inventory-request',
        playerId,
        ItemConstructor.withCustomizations(
          {
            title: 'Faction Keys Locker',
            items: ItemConstructor.bundle(
              new ItemConstructor((
                () => Array.from(this._lockerKeys.keys()).filter((lockerKey: number) => this._lockerKeys.get(lockerKey).filter((assignedPlayerId: number) => isNaN(assignedPlayerId))?.length)
              ).bind(this), 'factionvehiclekeys').get()
            )
          },
          {
            topLeft: (value) => this._lockerKeys.get(Number(value.bottomRight.replace('#', ''))).filter((assignedPlayerId: number) => isNaN(assignedPlayerId))?.length,
          }
        )
      );
    }

    protected isPlayerAtVehicleKeysLocker(playerId: number): boolean {
      const playerPosition: number[] = GetEntityCoords(GetPlayerPed(playerId), true);
      return isPlayerInRangeOfPoint(playerPosition[0], playerPosition[1], playerPosition[2], this._lockerKeyPosition[0], this._lockerKeyPosition[1], this._lockerKeyPosition[2], 1.5);
    }

    protected registerVehicles(colors: number[], ...vehicles: FactionVehicle[]): void {
      const _vehicles: FactionVehicle[] = vehicles.map((factionVehicle: FactionVehicle) => ({ ...factionVehicle, color: colors }));

      this._pendingVehicles = _vehicles;
      _vehicles.flatMap((_vehicle, index: number) => [index, index]).forEach((vehicleIndexes: number) => {
        this._lockerKeys.set(vehicleIndexes, [NaN, NaN]);
      });

      if (global.exports['armoury'].getPlayers()?.length > 0) {
        this.spawnVehicles(_vehicles);

        console.log(`Players already online, and I have been restarted. Creating faction vehicles of faction '${this.factionInternalId}'.`);
      }
    }

    protected registerVehicleKeyLockerPosition(position: number[]): void {
      this._lockerKeyPosition = position;
    }

    protected toggleLockOfThisVehicle(vehicleEntityId: number, playerId: number): void {
      SetVehicleDoorsLocked(vehicleEntityId, GetVehicleDoorLockStatus(vehicleEntityId) !== 2 ? 2 : 1);
      TriggerClientEvent('vehicles:vehicle-should-bleep-lights', playerId, NetworkGetNetworkIdFromEntity(vehicleEntityId));
    }

    @EventListener({ eventName: 'inventory:inventory-item-clicked' })
    // Possible cause of performance issue? This will be intercepted in all server-faction.controller.ts's
    public onInventoryItemClicked(itemClickEvent: { item: Item }): void {
      if (itemClickEvent.item._piKey === 'factionvehiclekeys') {
        const keyComputed: number = Number(itemClickEvent.item.bottomRight.replace('#', ''));
        if (!isNaN(keyComputed) && this.isPlayerMemberOfThisFaction(source) && this._spawnedVehicles?.length - 1 >= keyComputed) {
          const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);
          const vehiclePosition: number[] = GetEntityCoords(this._spawnedVehicles.at(keyComputed), true);

          if (calculateDistance([playerPosition[0], playerPosition[1], playerPosition[2], vehiclePosition[0], vehiclePosition[1], vehiclePosition[2]]) < 6.0) {
            this.toggleLockOfThisVehicle(this._spawnedVehicles.at(keyComputed), source)
          }
        }
      }
    }

    @EventListener({ eventName: `factions-${GetCurrentResourceName().split('-')[1]}:unlock-this-vehicle` })
    public onFactionVehicleShouldUnlockForPlayer(factionVehicleNetworkId: number): void {
      if (this.isPlayerMemberOfThisFaction(source)) {
        this.toggleLockOfThisVehicle(NetworkGetEntityFromNetworkId(factionVehicleNetworkId), source);
      }
    }

    @EventListener()
    public onPlayerAuthenticate(playerId: number, _player: any): void {
      const isPlayerMemberOfThisFaction: boolean = this.isPlayerMemberOfThisFaction(playerId);

      if (this._lockerKeyPosition?.length) {
        if (isPlayerMemberOfThisFaction) {
          TriggerClientEvent(`${GetCurrentResourceName()}:add-vehicle-locker-action-points`, playerId, [this.lockerKeyPosition]);
        }

        global.exports['authentication'].setPlayerInfo(
          playerId,
          'factionvehiclekeys',
          []
        );

        global.exports['authentication'].setPlayerInfo(
          playerId,
          'factionnetworkvehiclekeys',
          []
        );
      }

      if (isPlayerMemberOfThisFaction) {
        global.exports['authentication'].setPlayerInfo(
          playerId,
          'factioninternalid',
          this._factionInternalId
        );
      }
    }

    @EventListener()
    public override onPlayerDisconnect(): void {
      super.onPlayerDisconnect();

      const keyFoundAssignedToMe: number = Array.from(this._lockerKeys.keys()).find((_key: number) => this._lockerKeys.get(_key).includes(source));

      if (!isNaN(keyFoundAssignedToMe)) {
        this._lockerKeys.set(
          keyFoundAssignedToMe,
          this._lockerKeys.get(keyFoundAssignedToMe).map((_key: number) => _key === source ? NaN : _key)
        );
      }

      global.exports['authentication'].setPlayerInfo(
        source,
        'factionvehiclekeys',
        []
      );

      global.exports['authentication'].setPlayerInfo(
        source,
        'factionnetworkvehiclekeys',
        []
      );

      global.exports['authentication'].setPlayerInfo(
        source,
        'factioninternalid',
        ''
      );
    }

    @EventListener({ eventName: 'inventory:client-receive-item' })
    public onPlayerTriesToGetFactionKey(item: Item): void {
      if (item._piKey === 'factionvehiclekeys' && this.isPlayerAtVehicleKeysLocker(source)) {
        const key: number = Number(item.bottomRight.replace('#', ''));
        const lockerKeyArray: number[] = this._lockerKeys.get(key);
        const lockerKeyArrayWithoutMe = lockerKeyArray.filter((_key: number) => _key !== source);
        const numberOfPreviouslyUnassignedKeys: number = lockerKeyArray.filter((_key: number) => isNaN(_key)).length;

        if (numberOfPreviouslyUnassignedKeys <= 1 && this.getFactionMemberRank(source) < 6) {
          // TODO: Add some sort of UI message here alerting the player that he can only take the last key if he is a leader.
          return;
        }

        if (numberOfPreviouslyUnassignedKeys && !Array.from(this._lockerKeys.values()).flat().filter((_key: number) => _key === source)?.length) {
          this._lockerKeys.set(key,
            [
              source,
              ...lockerKeyArrayWithoutMe,
              ...new Array(this._maxLockerKeys).fill(NaN)
            ].slice(0, this._maxLockerKeys)
          );

          global.exports['inventory'].givePlayerItem(
            source,
            item,
            key,
            undefined,
            true
          );

          global.exports['authentication'].setPlayerInfo(
            source,
            'factionnetworkvehiclekeys',
            [
              ...global.exports['authentication'].getPlayerInfo(
                source,
                'factionnetworkvehiclekeys'
              ),
              NetworkGetNetworkIdFromEntity(this._spawnedVehicles.at(key))
            ]
          );

          this.openVehicleKeysLockerForPlayer(source);
        }
      }
    };

    @EventListener({ eventName: 'inventory:client-give-to-additional-inventory' })
    public onPlayerTriesToGiveFactionKeyBack(item: Item): void {
      if (item._piKey === 'factionvehiclekeys' && this.isPlayerAtVehicleKeysLocker(source)) {
        const key: number = Number(item.bottomRight.replace('#', ''));

        global.exports['authentication'].setPlayerInfo(
          source,
          'factionvehiclekeys',
          (global.exports['authentication'].getPlayerInfo(source, 'factionvehiclekeys') || [])
            .filter((fvk: number) => fvk !== key)
        );

        global.exports['authentication'].setPlayerInfo(
          source,
          'factionnetworkvehiclekeys',
          (global.exports['authentication'].getPlayerInfo(source, 'factionnetworkvehiclekeys') || [])
            .filter((fvk: number) => fvk !== NetworkGetNetworkIdFromEntity(this._spawnedVehicles.at(key)))
        );

        this._lockerKeys.set(
          key,
          this.lockerKeys.get(key).map((playerAssignedTo: number) => (playerAssignedTo === source ? NaN : playerAssignedTo))
        );

        this.openVehicleKeysLockerForPlayer(source);
      }
    }

    @Command()
    public openKeyLocker(source: number): void {
      this.openVehicleKeysLockerForPlayer(source);
    }

    private _assignDefaultListeners(): void {
      onNet(`${GetCurrentResourceName()}:get-faction-information`, () => {
        const faction: Faction = global.exports['factions'].getFaction(this.factionInternalId);

        if (faction) {
          TriggerClientEvent(`${GetCurrentResourceName()}:get-faction-information-response`, source, faction);
        }
      });

      onNet('onResourceStop', (resourceName: string) => {
        if (resourceName === GetCurrentResourceName()) {
          this.clearVehicleSpawnTimeout();
          this.removeVehicles();
        }
      });

      onNet('authentication:player-authenticated', () => {
        if (!(this._pendingVehicles?.length > 0 && this.spawnedVehicles?.length > 0)) {
          this.spawnVehicles(this._pendingVehicles);

          console.log(`A player has joined. Creating faction vehicles of faction '${this.factionInternalId}'.`);
        }
      });

      onNet('playerDropped', () => {
        if (!(global.exports['armoury'].getPlayers()?.length > 0)) {
          this.clearVehicleSpawnTimeout();
          this.removeVehicles();
          console.log(`No player left. Destroying faction vehicles of faction '${this.factionInternalId}'.`);
        }
      });
    }

    protected removeVehicle(vehicle: number, ignoreSplice?: boolean): void {
      if (DoesEntityExist(vehicle)) {
        DeleteEntity(vehicle);
      }

      if (this._spawnedVehicles.indexOf(vehicle) > -1) {
        if (!ignoreSplice) {
          this._spawnedVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
          this._pendingVehicles.splice(this._spawnedVehicles.indexOf(vehicle), 1);
        }
      }
    }

    protected removeVehicles(): void {
      this._spawnedVehicles.forEach((vehicle: number) => {
        this.removeVehicle(vehicle, true);
      });

      this._spawnedVehicles = [];
    }

    protected spawnVehicles(vehicles: FactionVehicle[]): void {
      this.vehicleSpawnTimeout = setTimeout(() => {
        vehicles.forEach((vehicle: FactionVehicle, index: number) => {
          const spawnedVehicle: number = CreateVehicle(vehicle.modelHash, vehicle.pos[0], vehicle.pos[1], vehicle.pos[2], 0.0, true, true);
          this._spawnedVehicles.push(spawnedVehicle);

          setTimeout(() => {
              SetVehicleColours(spawnedVehicle, vehicle.color[0], vehicle.color[1]);
              SetEntityRotation(spawnedVehicle, vehicle.pos[3], vehicle.pos[4], vehicle.pos[5], 2, true);
              SetVehicleNumberPlateText(spawnedVehicle, `${this._factionInternalId.slice(0, 3)} ${index.toString().padStart(4, '0')}`);
              SetVehicleDoorsLocked(spawnedVehicle, 2);
          }, 5000);
        });

        this.vehicleSpawnTimeout = null;
      }, 2000);
    }

    private clearVehicleSpawnTimeout(): void {
      if (this.vehicleSpawnTimeout) {
        clearTimeout(this.vehicleSpawnTimeout);
        this.vehicleSpawnTimeout = null;
      }
    }
}