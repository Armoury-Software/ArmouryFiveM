import { Business } from '../../shared/models/business.interface';
import { ServerEntityWithEntranceController } from '../../../../[utils]/server/entity-controllers/server-entity-entrance.controller';
import { BUSINESS_INTERIORS } from '../../shared/business-interiors';
import { numberWithCommas } from '../../../../[utils]/utils';
import { UIDialog } from '../../../../[utils]/models/ui-dialog.model';

export class Server extends ServerEntityWithEntranceController<Business> {
    public constructor(dbTableName: string) {
        super(dbTableName);

        this.registerCommands();
        this.registerListeners();
        this.registerExports();
    }

    private registerCommands(): void {
        this.RegisterAdminCommand('removebusiness', 6, (source: number, args: any[]) => {
            let business: Business = this.getClosestEntityOfSameTypeToPlayer(source);
            if (args && args[0]) {
                business = this.getEntityByDBId(Number(args[0])) || this.getClosestEntityOfSameTypeToPlayer(source);
            }

            if (!business) {
                console.log('Failed - Business undefined');
                return;
            }
            
            console.log(global.exports['authentication'].getPlayerInfo(source, 'name'), 'removed a business!');
            this.removeEntity(business);
        }, false);

        this.RegisterAdminCommand('createbusiness', 6, (source: number, args: any[]) => {
            if (args.length < 3) {
                console.log('Syntax: /createbusiness <business-type> <price> <level>!');
                return;
            }
            const businessType: number = Number(args[0]);
            const price: number = Number(args[1]);
            const level: number = Number(args[2]);
            const position: number[] = GetEntityCoords(GetPlayerPed(source), true);

            if (BUSINESS_INTERIORS[businessType].isUnique && this.entities.find((business: Business) => business.name === BUSINESS_INTERIORS[businessType].name)) {
                global.exports['chat'].addMessage(source, 'Because this business type is unique, there can only be one business of this type on the server.');
                return;
            }

            test

            this.createEntity({
                owner: '',
                level,
                name: BUSINESS_INTERIORS[businessType].name,
                entranceX: position[0],
                entranceY: position[1],
                entranceZ: position[2],
                firstPurchasePrice: price,
                exitX: BUSINESS_INTERIORS[businessType].pos[0],
                exitY: BUSINESS_INTERIORS[businessType].pos[1],
                exitZ: BUSINESS_INTERIORS[businessType].pos[2],
                sellingPrice: 0,
                partnerIds: [],
                parent: -1,
                productPrice: BUSINESS_INTERIORS[businessType].defaultProductPrice // TODO: Find possible parent here and assign it correctly
            } as Business);
        }, false);

        RegisterCommand('enterbusiness', (source: number) => {
            const business: Business = this.getClosestEntityOfSameTypeEntranceToPlayer(source);
            if (!business) {
                global.exports['chat'].addMessage(source, 'Couldn\'t find a valid business.');
                return;
            }

            if (!this.isEnterable(business)) { // 24/7
                // TODO: Show 24/7 menu here
                return;
            }

            const isOwnedByMe: boolean = business.owner === global.exports['authentication'].getPlayerInfo(source, 'name');
            if (!(isOwnedByMe || business.partnerIds.includes(Number(global.exports['authentication'].getPlayerInfo(source, 'id'))))) {
                TriggerClientEvent(`${GetCurrentResourceName()}:force-showui`, source, business);
            } else {
                this.teleportIntoBusiness(source, business);
            }
        }, false);

        RegisterCommand('exitbusiness', (source: number) => {
            let business: Business = this.getClosestEntityOfSameTypeExitToPlayer(source);

            if (business) {
                SetEntityCoords(GetPlayerPed(source), business.entranceX, business.entranceY, business.entranceZ, true, false, false, true);
                SetEntityRoutingBucket(GetPlayerPed(source), 0);
            }
        }, false);

        RegisterCommand('businessmenu', (source: number) => {
            const virtualWorld: number = GetEntityRoutingBucket(GetPlayerPed(source));
            const business: Business = this.entities.find((_business: Business) => _business.id === virtualWorld);

            if (virtualWorld === 0 || !business) {
                console.log('Failed to show businessmenu to ', GetPlayerName(source));
                return;
            }

            TriggerClientEvent(
                `${GetCurrentResourceName()}-menu:force-showui`,
                source,
                {
                    stats: [
                        { key: 'Level', value: business.level },
                        { key: 'Partners', value: business.partnerIds?.length },
                        { key: 'Income', value: '$750/hr' },
                        { key: 'Security(%)', value: '0%' },
                        { key: 'Pet', value: 'German Shepherd' },
                        { key: 'Pet Status', value: 'Happy' },
                        { key: 'Price', value: business.sellingPrice > 0 ? `$${numberWithCommas(business.sellingPrice)}` : 'Not for Sale' },
                        { key: 'Value', value: '$' + numberWithCommas(business.firstPurchasePrice) },
                        { key: 'Upgrades', value: '0/3' },
                        { key: 'Taxes', value: '$1,000/hr' },
                        { key: 'Pet Expenses', value: '$50/hr' }
                    ],
                    items: business.partnerIds.map((_tenant: number) => ({
                        outline: '#404158',
                        topLeft: '1',
                        bottomRight: '',
                        width: 65,
                        image: '1'
                    })),
                    leftMenu: {
                        description: 'Business Management',
                        buttons: [
                          {
                            title: 'Set For Sale',
                            subtitle: 'Enable players to buy your business',
                            icon: 'sell'
                          },
                          {
                            title: 'Sell To Bank',
                            subtitle: 'Sell immediately for 50% value',
                            icon: 'account_balance'
                          },
                          {
                            title: 'Fire All Partners',
                            subtitle: 'Fire all partners immediately',
                            icon: 'logout'
                          }
                        ]
                    },
                    rightMenu: {
                        description: 'Business Upgrades',
                        buttons: [
                          {
                            title: 'Heal Upgrade',
                            subtitle: 'Enable healing for $300/hr',
                            icon: 'favorite_border'
                          },
                        ]
                    },
                    title: `Business Menu - ${business.owner}'s ${business.name} (#${business.id})`
                }
            );
        }, false);
    }

    private registerListeners(): void {
        onNet(`${GetCurrentResourceName()}:request-purchase-business`, () => {
            const business: Business = this.getClosestEntityOfSameTypeToPlayer(source);

            if (business.owner && business.sellingPrice > 0 || !business.owner && business.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(source, 'cash'))) {
                const businessPrice: number = !business.owner ? business.firstPurchasePrice : business.sellingPrice;
                
                TriggerClientEvent(`${GetCurrentResourceName()}:show-dialog`, source, <UIDialog>{
                    title: 'Purchase this business?',
                    content: `Are you sure you want to purchase this business for $${numberWithCommas(businessPrice)}?`,
                    buttons: [{ title: 'Confirm' }],
                    dialogId: 'purchase_unowned_business'
                });
            }
        });

        onNet(`${GetCurrentResourceName()}:confirm-purchase-business`, async (_source: number) => {
            const business: Business = this.getClosestEntityOfSameTypeToPlayer(_source);

            if (business.owner && business.sellingPrice > 0 || !business.owner && business.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(_source, 'cash'))) {
                const businessPrice: number = !business.owner ? business.firstPurchasePrice : business.sellingPrice;
                const businessPreviousOwner: string = business.owner;
                
                business.owner = global.exports['authentication'].getPlayerInfo(_source, 'name');
                const result: boolean = await this.saveDBEntityAsync(business.id);

                if (result) {
                    global.exports['authentication'].setPlayerInfo(_source, 'cash', Number(global.exports['authentication'].getPlayerInfo(_source, 'cash')) - businessPrice, false);
                    global.exports['authentication'].setPlayerInfo(_source, 'businesskeys', [...<number[]>global.exports['authentication'].getPlayerInfo(_source, 'businesskeys'), business.id]);

                    this.teleportIntoBusiness(_source, business);
                    TriggerClientEvent(`${GetCurrentResourceName()}:business-purchased`, _source, business);
                } else {
                    business.owner = businessPreviousOwner;
                }
            }
        });
    }

    protected syncWithClients(client?: number): void {
        super.syncWithClients(client);

        if (client) {
            const playerName: string = global.exports['authentication'].getPlayerInfo(client, 'name');
            const businessesOwnedByPlayer: Business[] = this.entities.filter((business: Business) => business.owner === playerName);

            if (businessesOwnedByPlayer.length) {
                global.exports['authentication'].setPlayerInfo(client, 'businesskeys', businessesOwnedByPlayer.map((business: Business) => business.id));
            }
        }
    }

    protected isEnterable(business: Business): boolean {
        return (business.entranceX !== 0.0 && business.entranceY !== 0.0 && business.entranceZ !== 0.0);
    }

    private teleportIntoBusiness(source: number, business: Business): void {
        SetEntityCoords(GetPlayerPed(source), business.exitX, business.exitY, business.exitZ, true, false, false, true);
        SetEntityRoutingBucket(GetPlayerPed(source), business.id);
    }

    private registerExports(): void {
        exports('getClosestBusiness', this.getClosestEntityOfSameTypeToPlayer);
        exports('getClosestBusinessExit', this.getClosestEntityOfSameTypeExitToPlayer);
    }
}
