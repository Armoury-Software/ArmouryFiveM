import { House } from '../../shared/models/house.interface';
import { ServerEntityWithEntranceController } from '../../../../[utils]/server/entity-controllers/server-entity-entrance.controller';
import { HOUSE_INTERIORS } from '../../shared/house-interiors';
import { numberWithCommas } from '../../../../[utils]/utils';
import { UIDialog } from '../../../../[utils]/models/ui-dialog.model';
import { addTenants, getTenants } from '../../shared/house.functions';

export class Server extends ServerEntityWithEntranceController<House> {
    public constructor(dbTableName: string) {
        super(dbTableName);

        this.registerCommands();
        this.registerListeners();
        this.registerExports();
    }

    private registerCommands(): void {
        this.RegisterAdminCommand('removehouse', 6, (source: number, args: any[]) => {
            let house: House = this.getClosestEntityOfSameTypeToPlayer(source);
            if (args && args[0]) {
                house = this.getEntityByDBId(Number(args[0])) || this.getClosestEntityOfSameTypeToPlayer(source);
            }

            if (!house) {
                console.log('Failed - House undefined');
                return;
            }
            
            console.log(global.exports['authentication'].getPlayerInfo(source, 'name'), 'removed a house!');
            this.removeEntity(house);
        }, false);

        this.RegisterAdminCommand('createhouse', 6, (source: number, args: any[]) => {
            if (args.length < 3) {
                console.log('Syntax: /createhouse <interior> <price> <level>!');
                return;
            }
            const interior: number = Number(args[0]);
            const price: number = Number(args[1]);
            const level: number = Number(args[2]);
            const position: number[] = GetEntityCoords(GetPlayerPed(source), true);

            this.createEntity({
                owner: 'nobody',
                level,
                entranceX: position[0],
                entranceY: position[1],
                entranceZ: position[2],
                firstPurchasePrice: price,
                exitX: HOUSE_INTERIORS[interior].pos[0],
                exitY: HOUSE_INTERIORS[interior].pos[1],
                exitZ: HOUSE_INTERIORS[interior].pos[2],
                sellingPrice: 0,
                rentPrice: 0,
                tenantIds: []
            } as House);
        }, false);

        RegisterCommand('enterhouse', (source: number) => {
            const house: House = this.getClosestEntityOfSameTypeEntranceToPlayer(source);
            if (!house) {
                console.log('couldnt find a valid house');
                return;
            }

            const isOwnedByMe: boolean = house.owner === global.exports['authentication'].getPlayerInfo(source, 'name');

            if (!(isOwnedByMe || house.tenantIds.includes(Number(global.exports['authentication'].getPlayerInfo(source, 'id'))))) {
                TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source, house);
            } else {
                this.teleportIntoHouse(source, house);
            }
        }, false);

        RegisterCommand('exithouse', (source: number) => {
            let house: House = this.getClosestEntityOfSameTypeExitToPlayer(source);

            if (house) {
                SetEntityCoords(GetPlayerPed(source), house.entranceX, house.entranceY, house.entranceZ, true, false, false, true);
                SetEntityRoutingBucket(GetPlayerPed(source), 0);
            }
        }, false);

        RegisterCommand('housemenu', (source: number) => {
            const virtualWorld: number = GetEntityRoutingBucket(GetPlayerPed(source));
            const house: House = this.entities.find((_house: House) => _house.id === virtualWorld);

            if (virtualWorld === 0 || !house) {
                console.log('Failed to show housemenu to ', GetPlayerName(source));
                return;
            }

            TriggerClientEvent(
                `${GetCurrentResourceName()}-menu:force-showui`,
                source,
                {
                    stats: [
                        { key: 'Level', value: house.level },
                        { key: 'Tenants', value: house.tenantIds?.length },
                        { key: 'Income', value: '$750/hr' },
                        { key: 'Security(%)', value: '0%' },
                        { key: 'Pet', value: 'German Shepherd' },
                        { key: 'Pet Status', value: 'Happy' },
                        { key: 'Price', value: house.sellingPrice > 0 ? `$${numberWithCommas(house.sellingPrice)}` : 'Not for Sale' },
                        { key: 'Value', value: '$' + numberWithCommas(house.firstPurchasePrice) },
                        { key: 'Rent Price', value: `$${numberWithCommas(house.rentPrice)}/hr` },
                        { key: 'Upgrades', value: '0/3' },
                        { key: 'Taxes', value: '$1,000/hr' },
                        { key: 'Pet Expenses', value: '$50/hr' }
                    ],
                    items: house.tenantIds.map((_tenant: number) => ({
                        outline: '#404158',
                        topLeft: '1',
                        bottomRight: '',
                        width: 65,
                        image: '1'
                    })),
                    leftMenu: {
                        description: 'House Management',
                        buttons: [
                          {
                            title: 'Set for Sale',
                            subtitle: 'Enable players to buy your house',
                            icon: 'sell'
                          },
                          {
                            title: 'Sell to Bank',
                            subtitle: 'Sell immediately for 50% value',
                            icon: 'account_balance'
                          },
                          {
                            title: 'Rent Options',
                            subtitle: 'Manage rent price or disable rent',
                            icon: 'supervisor_account'
                          },
                          {
                            title: 'Evict All Tenants',
                            subtitle: 'Evict all tenants immediately',
                            icon: 'logout'
                          }
                        ]
                    },
                    rightMenu: {
                        description: 'House Upgrades',
                        buttons: [
                          {
                            title: 'Heal Upgrade',
                            subtitle: 'Enable healing for $300/hr',
                            icon: 'favorite_border'
                          },
                          {
                            title: 'Armour Upgrade',
                            subtitle: 'Enable armour for $4,500/hr',
                            icon: 'shield'
                          },
                          {
                            title: 'Alarm Upgrade',
                            subtitle: 'Burglar protection for $1,000/hr',
                            icon: 'access_alarms'
                          },
                          {
                            title: 'Pet',
                            subtitle: 'Buy a pet for your house',
                            icon: 'pets'
                          }
                        ]
                    },
                    title: `House Menu - ${house.owner}'s House (#${house.id})`
                }
            );
        }, false);
    }

    private registerListeners(): void {
        onNet(`${GetCurrentResourceName()}:request-purchase-house`, () => {
            const house: House = this.getClosestEntityOfSameTypeToPlayer(source);

            if (house.owner !== 'nobody' && house.sellingPrice > 0 || house.owner === 'nobody' && house.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(source, 'cash'))) {
                const housePrice: number = house.owner === 'nobody' ? house.firstPurchasePrice : house.sellingPrice;
                
                TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, <UIDialog>{
                    title: 'Purchase this house?',
                    content: `Are you sure you want to purchase this house for $${numberWithCommas(housePrice)}?`,
                    buttons: [{ title: 'Confirm' }],
                    dialogId: 'purchase_unowned_house'
                });
            }
        });

        onNet(`${GetCurrentResourceName()}:confirm-purchase-house`, async (_source: number) => {
            const house: House = this.getClosestEntityOfSameTypeToPlayer(_source);

            if (house.owner !== 'nobody' && house.sellingPrice > 0 || house.owner === 'nobody' && house.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(_source, 'cash'))) {
                const housePrice: number = house.owner === 'nobody' ? house.firstPurchasePrice : house.sellingPrice;
                const housePreviousOwner: string = house.owner;
                
                house.owner = global.exports['authentication'].getPlayerInfo(_source, 'name');
                const result: boolean = await this.saveDBEntityAsync(house.id);

                if (result) {
                    global.exports['authentication'].setPlayerInfo(_source, 'cash', Number(global.exports['authentication'].getPlayerInfo(_source, 'cash')) - housePrice, false);
                    global.exports['authentication'].setPlayerInfo(_source, 'housekeys', [...<number[]>global.exports['authentication'].getPlayerInfo(_source, 'housekeys'), house.id]);

                    this.teleportIntoHouse(_source, house);
                    TriggerClientEvent(`${GetCurrentResourceName()}:house-purchased`, _source, house);
                } else {
                    house.owner = housePreviousOwner;
                }
            }
        });

        onNet(`${GetCurrentResourceName()}:request-become-tenant`, () => {
            const house: House = this.getClosestEntityOfSameTypeToPlayer(source);
            const playerDBId: number = Number(global.exports['authentication'].getPlayerInfo(source, 'id'));

            if (house.owner !== 'nobody' && house.rentPrice > 0 && house.rentPrice <= Number(global.exports['authentication'].getPlayerInfo(source, 'cash'))) {
                const rentPrice: number = house.rentPrice;
                const alreadyRentedHouse: House = this.entities.find((_house: House) => getTenants(house).includes(playerDBId));

                if (alreadyRentedHouse) {
                    console.log(`The player is already a tenant to house ${alreadyRentedHouse.id}!`);
                    return;
                }

                global.exports['authentication'].setPlayerInfo(source, 'cash', Number(global.exports['authentication'].getPlayerInfo(source, 'cash')) - rentPrice);
                addTenants(house, playerDBId);
                TriggerClientEvent(`${GetCurrentResourceName()}:house-became-tenant`, source, house);
                this.teleportIntoHouse(source, house);
                this.saveDBEntityAsync(house.id);
            }
        });
    }

    protected syncWithClients(client?: number): void {
        super.syncWithClients(client);

        if (client) {
            const playerName: string = global.exports['authentication'].getPlayerInfo(client, 'name');
            const housesOwnedByPlayer: House[] = this.entities.filter((house: House) => house.owner === playerName);

            if (housesOwnedByPlayer.length) {
                global.exports['authentication'].setPlayerInfo(client, 'housekeys', housesOwnedByPlayer.map((house: House) => house.id));
            }
        }
    }

    private teleportIntoHouse(source: number, house: House): void {
        SetEntityCoords(GetPlayerPed(source), house.exitX, house.exitY, house.exitZ, true, false, false, true);
        SetEntityRoutingBucket(GetPlayerPed(source), house.id);
    }

    private registerExports(): void {
        exports('getClosestHouse', this.getClosestEntityOfSameTypeToPlayer);
        exports('getClosestHouseExit', this.getClosestEntityOfSameTypeExitToPlayer);
    }
}
