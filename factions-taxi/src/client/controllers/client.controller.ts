import { ClientFactionController } from '@core/client/client-faction.controller';
import {
  EventListener,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { EVENT_DIRECTIONS } from '@core/decorators/event.directions';
import { isPlayerInRangeOfPoint } from '@core/utils';
import { TAXI_DEFAULTS } from '@shared/models/defaults';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientFactionController {
  private relationshipGroup: number;
  private driverCurrentTripInterval: NodeJS.Timer;

  public constructor() {
    super();

    // this.spawnTaxiNPC();
    this.setupNPCBehaviour();
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:ride-started` })
  public onDriverRideStarted(): void {
    if (!this.driverCurrentTripInterval) {
      this.driverCurrentTripInterval = setInterval(
        () => this.onDriverIntervalPassed(),
        TAXI_DEFAULTS.intervalBetweenDistanceChecks
      );
    }
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:ride-stopped` })
  public onDriverRideStopped(): void {
    this.clearDriverInterval();
  }

  @EventListener({ direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onPlayerExitVehicle(): void {
    this.clearDriverInterval();
  }

  private onDriverIntervalPassed(): void {
    TriggerServerEvent(`${GetCurrentResourceName()}:driver-interval-passed`);
  }

  private clearDriverInterval(): void {
    if (this.driverCurrentTripInterval) {
      clearInterval(this.driverCurrentTripInterval);
      this.driverCurrentTripInterval = null;
    }
  }

  private spawnTaxiNPC(): void {
    const position: number[] = GetEntityCoords(GetPlayerPed(-1));
    const taxiPosition: [boolean, number[]] = GetClosestVehicleNode(
      position[0] + 100.0 * Math.pow(-1, Math.floor(Math.random() * 3)),
      position[1] + 100.0 * Math.pow(-1, Math.floor(Math.random() * 3)),
      position[2],
      0,
      100.0,
      2.5
    );
    const vehicleHash: number | string = -956048545;

    this.createVehicleAsync(
      vehicleHash,
      taxiPosition[1][0],
      taxiPosition[1][1],
      taxiPosition[1][2],
      0.0,
      true,
      true,
      false
    ).then((vehicle: number) => {
      this.createPedInsideVehicleAsync(
        vehicle,
        26,
        GetHashKey('cs_movpremmale'),
        -1,
        true,
        true
      ).then((ped: number) => {
        TaskVehicleDriveToCoord(
          ped,
          vehicle,
          position[0],
          position[1],
          position[2],
          15.0,
          1.0,
          vehicleHash,
          5,
          5.0,
          1.0
        );
        SetEntityInvincible(ped, true);
        SetEntityAsMissionEntity(ped, true, true);
        SetPedRelationshipGroupHash(ped, this.relationshipGroup);
        SetVehicleDoorsLocked(vehicle, 0);
        const taxiBlip: number = AddBlipForEntity(ped);
        SetBlipAsFriendly(taxiBlip, true);
        SetBlipSprite(taxiBlip, 198);
        SetBlipColour(taxiBlip, 5);

        AddTextEntry('TAXIBLIP', 'Your taxi driver');
        BeginTextCommandSetBlipName('TAXIBLIP');
        AddTextComponentSubstringPlayerName('me');
        EndTextCommandSetBlipName(taxiBlip);

        this.addToTickUnique({
          id: `${GetCurrentResourceName()}_taxitransport`,
          function: () => {
            const playerPosition: number[] = GetEntityCoords(GetPlayerPed(-1));
            const taxiPosition: number[] = GetEntityCoords(ped);
            if (
              isPlayerInRangeOfPoint(
                playerPosition[0],
                playerPosition[1],
                playerPosition[2],
                taxiPosition[0],
                taxiPosition[1],
                taxiPosition[2],
                6.0
              )
            ) {
              DisableControlAction(0, 23, true);

              if (IsDisabledControlJustPressed(0, 23)) {
                TaskVehicleDriveToCoord(
                  ped,
                  vehicle,
                  165.74505615234375,
                  -1557.2967529296875,
                  29.24609375,
                  30.0,
                  1.0,
                  vehicleHash,
                  5,
                  5.0,
                  1.0
                );
                TaskWarpPedIntoVehicle(GetPlayerPed(-1), vehicle, 0);
                this.removeFromTick(
                  `${GetCurrentResourceName()}_taxitransport`
                );
              }
            } else {
              DisableControlAction(0, 23, false);
            }
          },
        });
      });
    });
  }

  private setupNPCBehaviour(): void {
    this.relationshipGroup = AddRelationshipGroup('taxi_driver')[1];
    SetRelationshipBetweenGroups(
      0,
      this.relationshipGroup,
      GetHashKey('PLAYER')
    );
    SetRelationshipBetweenGroups(
      0,
      GetHashKey('PLAYER'),
      this.relationshipGroup
    );
  }
}
