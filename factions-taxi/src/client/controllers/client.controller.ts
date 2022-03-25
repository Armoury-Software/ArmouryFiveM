import { ClientController } from '@core/client/client.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';
import { isPlayerInRangeOfPoint } from '@core/utils';

@FiveMController()
export class Client extends ClientController {
  private relationshipGroup: number;

  public constructor() {
    super();

    // this.spawnTaxiNPC();
    this.setupNPCBehaviour();
  }

  private spawnTaxiNPC(): void {
    const position: number[] = GetEntityCoords(PlayerPedId());
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
            const playerPosition: number[] = GetEntityCoords(PlayerPedId());
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
                TaskWarpPedIntoVehicle(PlayerPedId(), vehicle, 0);
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
