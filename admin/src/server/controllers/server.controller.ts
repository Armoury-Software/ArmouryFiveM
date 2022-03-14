import { ServerController } from '../../../../[utils]/server/server.controller';

export class Server extends ServerController {
  private createdVehicles: number[] = [];

  public constructor() {
    super();

    this.registerCommands();
  }

  private registerCommands(): void {
    RegisterCommand(
      'veh',
      (source: number, args: string[]) => {
        if (!args[0]) {
          console.log('ERROR! You should use /veh <vehiclename> <color>');
          return;
        }

        const model: string = args[0].toString();
        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));

        const createdVehicle = CreateVehicle(
          model,
          playerPosition[0],
          playerPosition[1],
          playerPosition[2],
          0,
          true,
          true
        );
        TaskWarpPedIntoVehicle(GetPlayerPed(source), createdVehicle, -1);
        SetVehicleCustomPrimaryColour(createdVehicle, 255, 255, 255);
        SetVehicleCustomSecondaryColour(createdVehicle, 255, 255, 255);
        this.createdVehicles.push(createdVehicle);
      },
      false
    );

    RegisterCommand(
      'destroyvehicles',
      () => {
        this.createdVehicles.forEach((createdVehicle: number) => {
          if (DoesEntityExist(createdVehicle)) {
            DeleteEntity(createdVehicle);
          }
        });

        this.createdVehicles = [];
      },
      false
    );

    RegisterCommand(
      'gotoveh',
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const vehiclePosition: number[] = GetEntityCoords(Number(args[0]));
        SetEntityCoords(
          GetPlayerPed(source),
          vehiclePosition[0],
          vehiclePosition[1],
          vehiclePosition[2],
          true,
          false,
          false,
          true
        );
      },
      false
    );

    RegisterCommand(
      'getveh',
      (source: number, args: number[]) => {
        if (!args.length) {
          return;
        }

        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source));
        SetEntityCoords(
          Number(args[0]),
          playerPosition[0],
          playerPosition[1] + 1.0,
          playerPosition[2] + 1.0,
          true,
          false,
          false,
          true
        );
      },
      false
    );

    RegisterCommand(
      'stats',
      (source: number) => {
        console.log(
          'Routing bucket:',
          GetEntityRoutingBucket(GetPlayerPed(source))
        );
      },
      false
    );
  }
}
