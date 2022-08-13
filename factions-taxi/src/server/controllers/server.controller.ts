import {
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerFactionController } from '@core/server/server-faction.controller';
import { calculateDistanceInKm } from '@core/utils';
import { TAXI_DEFAULTS } from '@shared/models/defaults';

import { TaxiDutyData } from '@shared/models/taxi-duty.interface';
import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
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
      content: this.translate('you_will_not_receive_calls'),
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
          416.3808288574219, -654.817138671875, 28.10657501220703,
          0.0004224551375955343, -0.04690247401595116, -88.86610412597656,
          271.1339111328125,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          416.3893737792969, -649.2540283203125, 28.10662841796875,
          0.001554021262563765, -0.035165149718523026, -90.13146209716797,
          269.8685302734375,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          416.4161682128906, -644.040771484375, 28.106460571289062,
          -0.00021416498930193484, -0.046408623456954956, -89.13082122802734,
          270.8691711425781,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          408.50018310546875, -636.0198974609375, 28.106468200683594,
          0.0019025325309485197, -0.044502824544906616, 90.15033721923828,
          90.15033721923828,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          408.40948486328125, -641.3467407226562, 28.106035232543945,
          -0.0008810093277134001, -0.033660516142845154, 91.21923828125,
          91.21923828125,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          408.46514892578125, -646.684326171875, 28.10626792907715,
          0.00013506940740626305, -0.049738168716430664, 90.19927215576172,
          90.19927215576172,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          408.4365234375, -652.0545043945312, 28.108768463134766,
          0.03175923228263855, -0.05202241614460945, 89.55818939208984,
          89.55821228027344,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          392.9778747558594, -638.6212768554688, 28.10654640197754,
          -0.0016030441038310528, -0.040772393345832825, -89.21466827392578,
          270.78533935546875,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          392.9705810546875, -649.6943359375, 28.106647491455078,
          -0.0005344846867956221, -0.04155291989445686, -89.96053314208984,
          270.0394592285156,
        ],
      },
      {
        modelHash: -956048545,
        pos: [
          393.0593566894531, -660.7091064453125, 28.138940811157227,
          -0.24277183413505554, -2.3348991870880127, -88.11754608154297,
          271.8741149902344,
        ],
      }
    );
  }
}
