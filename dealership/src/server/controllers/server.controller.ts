import {
  Command,
  EventListener,
  Export,
  FiveMController,
} from '@core/decorators/armoury.decorators';
import { ServerEntityWithEntranceController } from '@core/server/entity-controllers/server-entity-entrance.controller';
import { numberWithCommas } from '@core/utils';

import {
  Dealership,
  DealershipVehicle,
} from '@shared/models/dealership.interface';
import {
  CustomVehicleConfiguration,
  VEHICLES_DEFAULTS,
} from '@shared/vehicles.defaults';

@FiveMController()
export class Server extends ServerEntityWithEntranceController<Dealership> {
  private playersPendingAcquisition: number[] = [];

  @Command()
  public enterDealership(source: number, args: any[]): void {
    const dealership: Dealership =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);

    if (!dealership) {
      global.exports['chat'].addMessage(
        source,
        "Couldn't find a valid dealership."
      );
      return;
    }

    const vehicles: DealershipVehicle[] = this.getDealershipVehicles(
      dealership.id
    );

    if (vehicles.length) {
      SetEntityRoutingBucket(GetPlayerPed(source), dealership.id);

      TriggerClientEvent(
        `${GetCurrentResourceName()}:force-showui`,
        source,
        this.getVehicleByDealershipIndex(source, dealership, 0)
      );
    }
  }

  @Command(6)
  public dealershipAddModel(source: number, args: any[]): void {
    const dealership: Dealership =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);

    if (!dealership) {
      global.exports['chat'].addMessage(source, 'You are not at a dealership!');
    }

    if ((!args[0] && !args[1]) || !VEHICLES_DEFAULTS[args[0]]) {
      return global.exports['chat'].addMessage(
        source,
        'Command parameters: <vehicle-name> <stock>'
      );
    }

    const model: number = GetHashKey(args[0]);
    const stock: number = Number(args[1]);

    if (dealership.vehicles[model]) {
      dealership.vehicles[model].stock = stock;
    } else {
      dealership.vehicles[model] = {
        price: VEHICLES_DEFAULTS[args[0]].price,
        stock: stock || 0,
      };
    }

    global.exports['chat'].addMessage(
      source,
      `This dealership will now sell vehicles of type '${args[0]}'. Updated stock: ${stock}.`
    );

    this.saveDBEntityAsync(dealership.id);
  }

  @Command(6)
  public dealershipRemoveModel(source: number, args: any[]): void {
    const dealership: Dealership =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);

    if (!dealership) {
      global.exports['chat'].addMessage(source, 'You are not at a dealership!');
    }

    if (!args[0] || !VEHICLES_DEFAULTS[args[0]]) {
      return global.exports['chat'].addMessage(
        source,
        'Command parameters: <vehicle-name>'
      );
    }

    const model: number = GetHashKey(args[0]);

    if (dealership.vehicles[model]) {
      delete dealership.vehicles[model];
    } else {
      global.exports['chat'].addMessage(
        source,
        `This dealership does not sell vehicles of type '${args[0]}'`
      );
      return;
    }

    global.exports['chat'].addMessage(
      source,
      `This dealership will not sell vehicles of type '${args[0]}' anymore.`
    );

    this.saveDBEntityAsync(dealership.id);
  }

  @Command(6)
  public dealershipEditModelPrice(source: number, args: any[]): void {
    const dealership: Dealership =
      this.getClosestEntityOfSameTypeEntranceToPlayer(source);

    if (!dealership) {
      return global.exports['chat'].addMessage(
        source,
        'You are not at a dealership!'
      );
    }

    if ((!args[0] && !args[1]) || !VEHICLES_DEFAULTS[args[0]]) {
      return global.exports['chat'].addMessage(
        source,
        'This dealership does not have that vehicle!'
      );
    }

    const model: number = GetHashKey(args[0]);
    const price: number = Number(args[1]);

    dealership.vehicles[model].price = price;

    global.exports['chat'].addMessage(
      source,
      `This dealership will now sell vehicles of type '${
        args[0]
      }' for $${numberWithCommas(price)}.`
    );

    this.saveDBEntityAsync(dealership.id);
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:want-to-buy` })
  public onPlayerRequestToBuy(data: any): void {
    const dealership: Dealership = this.getEntityByDBId(data.dealershipId);

    if (dealership) {
      const vehicleHash: number = Number(
        Object.keys(dealership.vehicles)[data.currentIndex]
      );
      const playerCash: number = Number(
        global.exports['authentication'].getPlayerInfo(source, 'cash')
      );
      const vehiclePrice: number = dealership.vehicles[vehicleHash].price;

      if (!dealership.vehicles[vehicleHash].stock) {
        TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, {
          title: 'Insufficient stock',
          content: `There is no vehicle of this type in stock at this dealership. Wait for stock replenishings in the future.`,
          buttons: [
            {
              label: 'Close',
            },
          ],
        });

        return;
      }

      if (playerCash >= vehiclePrice) {
        const vehicleDefault: CustomVehicleConfiguration =
          VEHICLES_DEFAULTS[
            Array.from(Object.keys(VEHICLES_DEFAULTS)).find(
              (key: string) => GetHashKey(key) === vehicleHash
            )
          ];

        TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, {
          title: 'Purchase confirmation',
          content: `You are about to purchase a <strong>${
            vehicleDefault.brand
          } ${
            vehicleDefault.description
          }</strong> for <strong>$${numberWithCommas(
            vehiclePrice
          )}</strong>. This action is irreversible. Are you sure?`,
          buttons: [
            {
              label: 'Purchase',
              important: true,
            },
            {
              label: 'Close',
            },
          ],
        });
      } else {
        TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, {
          title: 'Insufficient amount',
          content: `You do not have enough money to buy this vehicle. You are short of $${numberWithCommas(
            vehiclePrice - playerCash
          )}.`,
          buttons: [
            {
              label: 'Close',
            },
          ],
        });
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:dialog-button-pressed`,
  })
  public onDialogButtonPressed(data: any): void {
    if (data.buttonLabel) {
      switch (data.buttonLabel.toLowerCase()) {
        case 'purchase': {
          const dealership: Dealership = this.getEntityByDBId(
            data.dealershipId
          );

          if (dealership) {
            const vehicleHash: number = Number(
              Object.keys(dealership.vehicles)[data.currentIndex]
            );
            const playerCash: number = Number(
              global.exports['authentication'].getPlayerInfo(source, 'cash')
            );
            const vehiclePrice: number = dealership.vehicles[vehicleHash].price;

            if (
              playerCash >= vehiclePrice &&
              dealership.vehicles[vehicleHash].stock > 0
            ) {
              const target: number = source;

              this.playersPendingAcquisition.push(target);
              global.exports['authentication'].setPlayerInfo(
                target,
                'cash',
                playerCash - vehiclePrice
              );

              dealership.vehicles[vehicleHash].stock =
                dealership.vehicles[vehicleHash].stock - 1;

              TriggerClientEvent(
                `${GetCurrentResourceName()}:force-hideui`,
                target
              );

              setTimeout(() => {
                TaskWarpPedIntoVehicle(
                  GetPlayerPed(target),
                  global.exports['vehicles'].createVehicle(
                    vehicleHash,
                    target,
                    0,
                    0,
                    dealership.buySpawnX,
                    dealership.buySpawnY,
                    dealership.buySpawnZ,
                    dealership.buySpawnH
                  ),
                  -1
                );

                this.playersPendingAcquisition.splice(
                  this.playersPendingAcquisition.indexOf(target),
                  1
                );
              }, 2250);

              this.saveDBEntityAsync(dealership.id);
            }
          }
          break;
        }
      }
    }
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-previous-vehicle`,
  })
  public onPreviousVehicleRequested(
    dealershipId: number,
    currentIndex: number
  ): void {
    console.log(
      '(server.controller.ts:) Received request-previous-vehicle request from client. Switching and creating other vehicle..'
    );

    const totalVehicles: number =
      this.getDealershipNumberOfVehicles(dealershipId);
    const newIndex = currentIndex === 0 ? totalVehicles - 1 : currentIndex - 1;

    TriggerClientEvent(
      `${GetCurrentResourceName()}:force-showui`,
      source,
      this.getVehicleByDealershipIndex(source, dealershipId, newIndex)
    );

    return;
  }

  @EventListener({
    eventName: `${GetCurrentResourceName()}:request-next-vehicle`,
  })
  public onNextVehicleRequested(
    dealershipId: number,
    currentIndex: number
  ): void {
    console.log(
      '(server.controller.ts:) Received request-next-vehicle request from client. Switching and creating other vehicle..'
    );
    const totalVehicles: number =
      this.getDealershipNumberOfVehicles(dealershipId);
    const newIndex = currentIndex === totalVehicles - 1 ? 0 : currentIndex + 1;

    TriggerClientEvent(
      `${GetCurrentResourceName()}:force-showui`,
      source,
      this.getVehicleByDealershipIndex(source, dealershipId, newIndex)
    );

    return;
  }

  @EventListener({ eventName: `${GetCurrentResourceName()}:tp-me-back` })
  public onPlayerExitDealershipView(): void {
    if (!this.playersPendingAcquisition.includes(source)) {
      const dealership: Dealership = this.getEntityByDBId(
        GetEntityRoutingBucket(GetPlayerPed(source))
      );
      SetEntityCoords(
        GetPlayerPed(source),
        dealership.entranceX,
        dealership.entranceY,
        dealership.entranceZ,
        true,
        false,
        false,
        false
      );
    }
    SetEntityRoutingBucket(GetPlayerPed(source), 0);
  }

  @Export()
  public getDealershipVehicles(dealershipId: number): DealershipVehicle[] {
    const dealershipVehicles: { [modelHash: number]: DealershipVehicle } =
      this.getEntityByDBId(dealershipId)?.vehicles;

    if (dealershipVehicles) {
      return (
        Object.keys(dealershipVehicles).map((dealershipVehicleKey: string) => ({
          ...dealershipVehicles[dealershipVehicleKey],
          hash: Number(dealershipVehicleKey),
        })) || []
      );
    }

    return [];
  }

  @Export()
  public getDealershipNumberOfVehicles(dealershipId: number): number {
    const dealership: Dealership = this.getEntityByDBId(dealershipId);

    if (dealership) {
      return Object.keys(dealership.vehicles)?.length;
    }

    return 0;
  }

  @Export()
  public getVehicleByDealershipIndex(
    source: number,
    _dealership: Dealership | number,
    index: number
  ): any {
    let dealership: Dealership;

    if (typeof _dealership === 'number') {
      dealership = this.getEntityByDBId(_dealership);
    } else {
      dealership = _dealership;
    }

    const vehicles: DealershipVehicle[] = this.getDealershipVehicles(
      dealership.id
    );

    if (vehicles.length) {
      const vehicleDefaultByIndex: CustomVehicleConfiguration =
        VEHICLES_DEFAULTS[
          Array.from(Object.keys(VEHICLES_DEFAULTS)).find(
            (key: string) => GetHashKey(key) === vehicles[index].hash
          )
        ];

      return {
        vehicle: {
          name: {
            brand: vehicleDefaultByIndex.brand,
            description: vehicleDefaultByIndex.description,
          },
          details: [
            {
              label: 'Engine',
              value: 'V12, 60°, MPI',
            },
            {
              label: 'Max. Power',
              value: '740 CV @ 8.400 rpm',
            },
            {
              label: 'Top Speed',
              value: '350 KM/H (217 MPH)',
            },
            {
              label: 'Engine',
              value: 'V12, 60°, MPI',
            },
            {
              label: 'Max. Power',
              value: '740 CV @ 8.400 rpm',
            },
            {
              label: 'Top Speed',
              value: '350 KM/H (217 MPH)',
            },
          ],
          specs: [
            {
              label: 'Top Speed',
              progress: 80,
            },
            {
              label: 'Acceleration',
              progress: 100,
            },
            {
              label: 'Handling',
              progress: 80,
            },
            {
              label: 'Acceleration',
              progress: 100,
            },
          ],
          price: vehicles[index].price,
          stock: vehicles[index].stock,
          playerHasEnoughMoney:
            Number(
              global.exports['authentication'].getPlayerInfo(source, 'cash')
            ) >= vehicles[index].price,
          currentIndex: index,
          dealershipId: dealership.id,
        },
        camera: {
          pos: [
            dealership.viewCameraPosX,
            dealership.viewCameraPosY,
            dealership.viewCameraPosZ,
          ],
          vehicle: {
            hash: vehicles[index].hash,
            pos: [
              dealership.viewVehiclePosX,
              dealership.viewVehiclePosY,
              dealership.viewVehiclePosZ,
              dealership.viewVehiclePosH,
            ],
          },
        },
      };
    }

    return null;
  }
}
