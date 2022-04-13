import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerFactionController } from '@core/server/server-faction.controller';
import { calculateDistanceInKm } from '@core/utils';
import { TAXI_DEFAULTS } from '@shared/models/defaults';

import { TaxiDutyData } from '@shared/models/taxi-duty.interface';

@FiveMController()
export class Server extends ServerFactionController {
  private playersOnDuty: Map<number, TaxiDutyData> = new Map<
    number,
    TaxiDutyData
  >();

  @Export()
  public getAvailableTaxiDrivers(): [number, number][] {
    if (!this.playersOnDuty.size) {
      return [[-1, TAXI_DEFAULTS.minFare]];
    }

    return Array.from(this.playersOnDuty.keys()).map((taxiDriverId: number) => [
      taxiDriverId,
      this.playersOnDuty.get(taxiDriverId).fare,
    ]);
  }

  @Export()
  public startPlayerRide(playerId: number): void {
    const cachedFare: number = this.getPlayerFareCached(playerId);

    this.playersOnDuty.set(playerId, {
      ...this.playersOnDuty.get(playerId),
      taximeterOpen: true,
      fare: cachedFare,
      currentRidePay: cachedFare,
      lastDistanceCheckTimestamp: Date.now(),
      lastDistanceCheckPosition: GetEntityCoords(GetPlayerPed(playerId), true),
    });

    global.exports['armoury-overlay'].setTaximeterValue(playerId, cachedFare);

    const riders: number[] = this.playersOnDuty.get(playerId).riders;
    if (riders.length) {
      riders.forEach((riderId: number) => {
        global.exports['armoury-overlay'].setTaximeterValue(
          riderId,
          cachedFare
        );
      });
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:ride-started`, playerId);
  }

  @Export()
  public stopPlayerRide(playerId: number): void {
    if (this.playersOnDuty.has(playerId)) {
      global.exports['armoury-overlay'].setTaximeterValue(playerId, 0);

      const riders: number[] = this.playersOnDuty.get(playerId).riders;
      if (riders.length) {
        riders.forEach((riderId: number) => {
          global.exports['armoury-overlay'].setTaximeterValue(riderId, 0);
        });
      }

      this.playersOnDuty.set(playerId, {
        ...this.playersOnDuty.get(playerId),
        taximeterOpen: false,
        currentRidePay: 0,
      });
    }

    TriggerClientEvent(`${GetCurrentResourceName()}:ride-stopped`, playerId);
  }

  @Export()
  public updatePlayerTaximeterValue(playerId: number, rideValue: number): void {
    global.exports['armoury-overlay'].setTaximeterValue(playerId, rideValue);

    if (this.playersOnDuty.has(playerId)) {
      this.playersOnDuty.set(playerId, {
        ...this.playersOnDuty.get(playerId),
        currentRidePay: rideValue,
      });
    }
  }

  @Export()
  public addToPlayerTaximeterValue(
    playerId: number,
    rideValueAddition: number
  ): void {
    if (this.playersOnDuty.has(playerId)) {
      this.updatePlayerTaximeterValue(
        playerId,
        this.playersOnDuty.get(playerId).currentRidePay + rideValueAddition
      );
    }
  }

  @Export()
  public isPlayerBusyWithRide(playerId: number): boolean {
    return (
      this.playersOnDuty.has(playerId) &&
      this.playersOnDuty.get(playerId).taximeterOpen
    );
  }

  @Export()
  public startPlayerDuty(playerId: number): void {
    global.exports['armoury-overlay'].setTaximeterValue(playerId, 0);

    const existingRiders: number[] = [];

    for (let i = 0; i < 3; i++) {
      const pedInVehicleSeat: number = GetPedInVehicleSeat(
        GetVehiclePedIsIn(GetPlayerPed(playerId), false),
        i
      );

      if (pedInVehicleSeat) {
        const riderPlayerId: number = NetworkGetEntityOwner(pedInVehicleSeat);
        existingRiders.push(riderPlayerId);
        this.updatePlayerTaximeterValue(riderPlayerId, 0);
      }
    }

    this.playersOnDuty.set(playerId, {
      taximeterOpen: false,
      fare: this.getPlayerFareCached(playerId),
      currentRidePay: 0,
      lastDistanceCheckTimestamp: Date.now(),
      lastDistanceCheckPosition: GetEntityCoords(GetPlayerPed(playerId), true),
      riders: existingRiders,
    });

    this.hideTaxiNotOnDutyMessage(playerId);
  }

  @Export()
  public stopPlayerDuty(
    playerId: number,
    ignoreHudMessage: boolean = false
  ): void {
    if (this.playersOnDuty.has(playerId)) {
      global.exports['armoury-overlay'].setTaximeterValue(playerId, NaN);

      const riders: number[] = this.playersOnDuty.get(playerId).riders;
      if (riders.length) {
        riders.forEach((riderId: number) => {
          global.exports['armoury-overlay'].setTaximeterValue(riderId, NaN);
        });
      }

      this.playersOnDuty.delete(playerId);
    }

    if (!ignoreHudMessage) {
      this.showTaxiNotOnDutyMessage(playerId);
    }
  }

  @Export()
  public isPlayerOnDuty(playerId: number): boolean {
    return this.playersOnDuty.has(playerId);
  }

  @Export()
  public getPlayerFare(playerId: number): number {
    return this.playersOnDuty.has(playerId)
      ? this.playersOnDuty.get(playerId).fare
      : NaN;
  }

  @Export()
  public getPlayerFareCached(playerId: number): number {
    return (
      Math.max(
        TAXI_DEFAULTS.minFare,
        Math.min(
          TAXI_DEFAULTS.maxFare,
          this.getPlayerClientsidedCacheKey(playerId, 'fare')
        )
      ) || Math.floor((TAXI_DEFAULTS.minFare + TAXI_DEFAULTS.maxFare) / 2)
    );
  }

  @Export()
  public setPlayerFare(playerId: number, fare: number): void {
    const computedFare: number = Math.floor(
      Math.min(Math.max(fare, TAXI_DEFAULTS.minFare), TAXI_DEFAULTS.maxFare)
    );

    if (this.playersOnDuty.has(playerId)) {
      this.playersOnDuty.set(playerId, {
        ...this.playersOnDuty.get(playerId),
        fare: computedFare,
      });
    }

    this.updatePlayerClientsidedCacheKey(playerId, 'fare', computedFare);
  }

  @Export()
  public getMaxFare(): number {
    return TAXI_DEFAULTS.maxFare;
  }

  @Export()
  public getMinFare(): number {
    return TAXI_DEFAULTS.minFare;
  }

  @EventListener()
  public onPlayerEnterVehicle(
    vehicleNetworkId: number,
    seatIAmTryingToEnter: number
  ): void {
    const vehicleId: number = NetworkGetEntityFromNetworkId(vehicleNetworkId);

    if (this.isVehicleOwnedByThisFaction(vehicleId)) {
      if (
        this.isPlayerMemberOfThisFaction(source) &&
        seatIAmTryingToEnter === -1
      ) {
        global.exports['general-context-menu'].addCachedButton(source, {
          label: 'Taxi',
          metadata: {
            buttonId: 'taxi-driver',
            vehicleNetworkId: vehicleNetworkId,
          },
        });

        this.showTaxiNotOnDutyMessage(source);
      }

      if (seatIAmTryingToEnter > -1) {
        const driver: number = GetPedInVehicleSeat(vehicleId, -1);
        if (driver > 0 && driver !== GetPlayerPed(source)) {
          const realDriver: number = NetworkGetEntityOwner(driver);

          if (realDriver >= 0 && this.playersOnDuty.has(realDriver)) {
            const mapValue: TaxiDutyData = this.playersOnDuty.get(realDriver);

            this.playersOnDuty.set(realDriver, {
              ...mapValue,
              riders: [...this.playersOnDuty.get(realDriver).riders, source],
            });

            this.updatePlayerTaximeterValue(source, mapValue.currentRidePay);
          }
        }
      }
    }
  }

  @EventListener()
  public onPlayerExitVehicle(_vehicleNetworkId: number): void {
    // TODO: Send this NetworkGetEntityFromNetworkId directly from event as parameter, we are calling it from too many places!
    const vehicle: number = NetworkGetEntityFromNetworkId(_vehicleNetworkId);

    if (this.spawnedVehicles.includes(vehicle)) {
      const driver: number = GetPedInVehicleSeat(vehicle, -1);
      if (driver > 0 && driver !== GetPlayerPed(source)) {
        const driverPlayerId: number = NetworkGetEntityOwner(driver);

        if (this.playersOnDuty.has(driverPlayerId)) {
          const mapValue: TaxiDutyData = this.playersOnDuty.get(driverPlayerId);

          this.playersOnDuty.set(driverPlayerId, {
            ...mapValue,
            riders: mapValue.riders.filter(
              (playerId: number) => playerId !== source
            ),
          });
        }
      }

      if (this.isPlayerOnDuty(source)) {
        this.stopPlayerDuty(source, true);
      } else {
        global.exports['armoury-overlay'].setTaximeterValue(source, NaN);
      }

      if (this.isPlayerMemberOfThisFaction(source)) {
        global.exports['general-context-menu'].removeCachedButton(
          source,
          'taxi-driver'
        );

        this.hideTaxiNotOnDutyMessage(source);
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:driver-interval-passed`,
  })
  public onDriverIntervalPassed(): void {
    if (
      this.playersOnDuty.has(source) &&
      Date.now() - this.playersOnDuty.get(source).lastDistanceCheckTimestamp >=
        TAXI_DEFAULTS.intervalBetweenDistanceChecks -
          0.1 * TAXI_DEFAULTS.intervalBetweenDistanceChecks
    ) {
      const playerPosition: number[] = GetEntityCoords(
        GetPlayerPed(source),
        true
      );

      const lastCheckPosition: number[] =
        this.playersOnDuty.get(source).lastDistanceCheckPosition ||
        playerPosition;

      const distance: number = calculateDistanceInKm([
        playerPosition[0],
        playerPosition[1],
        playerPosition[2],
        lastCheckPosition[0],
        lastCheckPosition[1],
        lastCheckPosition[2],
      ]);

      this.playersOnDuty.set(source, {
        ...this.playersOnDuty.get(source),
        lastDistanceCheckTimestamp: Date.now(),
        lastDistanceCheckPosition: playerPosition,
      });

      this.addToPlayerTaximeterValue(
        source,
        Math.max(0, Math.floor(distance * this.getPlayerFare(source)))
      );

      this.playersOnDuty.get(source).riders.forEach((rider: number) => {
        this.updatePlayerTaximeterValue(
          rider,
          this.playersOnDuty.get(source).currentRidePay
        );
      });
    }
  }

  private showTaxiNotOnDutyMessage(playerId: number): void {
    global.exports['armoury-overlay'].setMessage(playerId, {
      id: 'taxi-not-on-duty',
      content: 'You will not yet receive calls because you are not on duty.',
    });
  }

  private hideTaxiNotOnDutyMessage(playerId: number): void {
    global.exports['armoury-overlay'].deleteMessage(playerId, {
      id: 'taxi-not-on-duty',
    });
  }

  constructor() {
    super();

    this.registerVehicleKeyLockerPosition([
      1161.79833984375, -3198.590087890625, -39.00794219970703,
    ]);

    this.registerVehicles(
      [88, 88],
      {
        modelHash: -956048545,
        pos: [
          416.0439453125, -644.0439453125, 28.100341796875, 0.0559806227684021,
          0.00011413223546696827, -90.2237319946289,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          416.00439453125, -649.3713989257812, 28.100341796875,
          -0.0003272554313298315, 0.05598462000489235, -90.66983032226562,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          416.00439453125, -654.7648315429688, 28.100341796875,
          1.6675267389132387e-8, 0.055975910276174545, -89.9999771118164,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          409.29229736328125, -652.0615234375, 28.100341796875,
          0.05597567558288574, -0.0001638552057556808, 90.33543395996094,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          409.27911376953125, -646.7472534179688, 28.100341796875,
          0.05597548186779022, 0.00021835426741745323, 89.55299377441406,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          409.22637939453125, -641.4461669921875, 28.100341796875,
          -0.00005951902858214453, 0.05598071217536926, 89.88805389404297,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          409.17364501953125, -635.9736328125, 28.100341796875,
          -0.0559854656457901, 0.00010931194992735982, 90.2237319946289,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.21759033203125, -638.6505737304688, 28.100341796875,
          0.055978551506996155, -0.0004949465510435402, -88.99671173095703,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.29669189453125, -644.2549438476562, 28.100341796875,
          0.05598071217536926, 0.00005951489947619848, -90.1119384765625,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.3230895996094, -649.6879272460938, 28.100341796875,
          0.05598049238324165, 0.00016869093815330416, -90.33541870117188,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.4021911621094, -655.028564453125, 28.100341796875,
          0.000381546764401719, 0.05597461387515068, -89.21891021728516,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.4021911621094, -660.6329345703125, 28.1171875,
          -0.18164598941802979, -1.7901086807250977, -89.12449645996094,
        ],
      }
    );
  }
}
