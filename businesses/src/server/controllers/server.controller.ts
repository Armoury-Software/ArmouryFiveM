import { Inject } from 'injection-js';
import {
  Command,
  Controller,
  EventListener,
  UIDialog,
  ServerEnterableDatabase,
  Export,
  StringFormatter,
  ServerVirtualWorldsService,
} from '@armoury/fivem-framework';
import { BUSINESS_INTERIORS } from '@shared/business-interiors';
import { Business } from '@shared/models/business.interface';

@Controller()
export class Server {
  public constructor(
    @Inject('Database') private readonly _database: ServerEnterableDatabase<Business>,
    @Inject(ServerVirtualWorldsService) private readonly _virtualWorlds: ServerVirtualWorldsService
  ) {
    this._database.onSync$.subscribe(this.syncWithClients);
  }

  @Export()
  public getClosestBusiness(source: number) {
    return this._database.getClosestToPlayer(source);
  }

  @Export()
  public getClosestBusinessExit(source: number) {
    return this._database.getClosestExitToPlayer(source);
  }

  @Command({ adminLevelRequired: 6 })
  public setDepositPosition(source: number, businessId: number) {
    if (Number.isNaN(Number(businessId))) {
      console.log('Syntax: /setdepositposition <business-id>!');
      return;
    }

    const business: Business = this._database.getEntityByDBId(businessId);
    const position: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(source.toString()));

    if (!business) {
      console.log('Failed - Business undefined');
      return;
    }

    business.depositX = position[0];
    business.depositY = position[1];
    business.depositZ = position[2];

    console.log(
      global.exports['authentication'].getPlayerInfo(source, 'name'),
      `has set a new deposit position for business ID ${business.id} to X: ${business.depositX.toFixed(
        4
      )}, Y:${business.depositY.toFixed(4)}, Z:${business.depositZ.toFixed(4)}!`
    );

    this._database.saveAsync(business.id);
  }

  @Command({ adminLevelRequired: 6 })
  public createBusiness(source: number, businessType: number, price: number, level: number) {
    if (Number.isNaN(Number(businessType)) || Number.isNaN(Number(price)) || Number.isNaN(Number(level))) {
      console.log('Syntax: /createbusiness <business-type> <price> <level>!');
      return;
    }

    const position: number[] = Cfx.Server.GetEntityCoords(Cfx.Server.GetPlayerPed(source.toString()));

    if (
      BUSINESS_INTERIORS[businessType].isUnique &&
      this._database.entities.find((business: Business) => business.name === BUSINESS_INTERIORS[businessType].name)
    ) {
      global.exports['chat'].addMessage(
        source,
        'Because this business type is unique, there can only be one business of this type on the server.'
      );
      return;
    }

    this._database.create({
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
      productPrice: BUSINESS_INTERIORS[businessType].defaultProductPrice, // TODO: Find possible parent here and assign it correctly
    } as Business);
  }

  @Command({ adminLevelRequired: 6 })
  public removeBusiness(source: number, businessId: number) {
    let business: Business = !Number.isNaN(Number(businessId))
      ? this._database.getEntityByDBId(businessId)
      : this._database.getClosestToPlayer(source);
    if (!business) {
      console.log('Failed - Business undefined');
      return;
    }

    console.log(global.exports['authentication'].getPlayerInfo(source, 'name'), 'removed a business!');

    this._database.remove(business);
  }

  @Command()
  public enterBusiness(source: number) {
    const business: Business = this._database.getClosestEntranceToPlayer(source);

    if (!business) {
      global.exports['chat'].addMessage(source, "Couldn't find a valid business.");
      return;
    }

    if (!this.isEnterable(business)) {
      Cfx.emit(`${Cfx.Server.GetCurrentResourceName()}:business-interact-request`, source, business);
      return;
    }

    const isOwnedByMe: boolean = business.owner === global.exports['authentication'].getPlayerInfo(source, 'name');
    if (
      !(
        isOwnedByMe ||
        business.partnerIds.includes(Number(global.exports['authentication'].getPlayerInfo(source, 'id')))
      )
    ) {
      Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:force-showui`, source, business);
    } else {
      this.teleportIntoBusiness(source, business);
    }
  }

  @Command()
  public exitBusiness(source: number) {
    let business: Business = this._database.getClosestExitToPlayer(source);

    if (business) {
      Cfx.Server.SetEntityCoords(
        Cfx.Server.GetPlayerPed(source.toString()),
        business.entranceX,
        business.entranceY,
        business.entranceZ,
        true,
        false,
        false,
        true
      );
      Cfx.Server.SetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString()), 0);
      this._virtualWorlds.setPlayerVirtualWorld(source, 0);
    }
  }

  @Command()
  public businessMenu(source: number) {
    const virtualWorld: number = Cfx.Server.GetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString()));
    const business: Business = this._database.entities.find((_business: Business) => _business.id === virtualWorld);

    if (virtualWorld === 0 || !business) {
      console.log('Failed to show businessmenu to ', Cfx.Server.GetPlayerName(source.toString()));
      return;
    }

    Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}-menu:force-showui`, source, {
      stats: [
        { key: 'Level', value: business.level },
        { key: 'Partners', value: business.partnerIds?.length },
        { key: 'Income', value: '$750/hr' },
        { key: 'Security(%)', value: '0%' },
        { key: 'Pet', value: 'German Shepherd' },
        { key: 'Pet Status', value: 'Happy' },
        {
          key: 'Price',
          value:
            business.sellingPrice > 0 ? `$${StringFormatter.numberWithCommas(business.sellingPrice)}` : 'Not for Sale',
        },
        {
          key: 'Value',
          value: '$' + StringFormatter.numberWithCommas(business.firstPurchasePrice),
        },
        { key: 'Upgrades', value: '0/3' },
        { key: 'Taxes', value: '$1,000/hr' },
        { key: 'Pet Expenses', value: '$50/hr' },
      ],
      items: business.partnerIds.map((_tenant: number) => ({
        outline: '#404158',
        topLeft: '1',
        bottomRight: '',
        width: 65,
        image: '1',
      })),
      leftMenu: {
        description: 'Business Management',
        buttons: [
          {
            title: 'Set For Sale',
            subtitle: 'Enable players to buy your business',
            icon: 'sell',
          },
          {
            title: 'Sell To Bank',
            subtitle: 'Sell immediately for 50% value',
            icon: 'account_balance',
          },
          {
            title: 'Fire All Partners',
            subtitle: 'Fire all partners immediately',
            icon: 'logout',
          },
        ],
      },
      rightMenu: {
        description: 'Business Upgrades',
        buttons: [
          {
            title: 'Heal Upgrade',
            subtitle: 'Enable healing for $300/hr',
            icon: 'favorite_border',
          },
        ],
      },
      title: `Business Menu - ${business.owner}'s ${business.name} (#${business.id})`,
    });
  }

  @Command({ adminLevelRequired: 1 })
  public bizId(source: number) {
    let business: Business = this._database.getClosestToPlayer(source);

    if (!business) {
      console.log('Failed - No business close to player.');
      return;
    }

    console.log(`Closest business ID is: ${business.id}`);
    return;
  }

  @EventListener({ eventName: `${Cfx.Server.GetCurrentResourceName()}:confirm-purchase-business` })
  public async onConfirmPurchase() {
    const player = Cfx.source;
    const business: Business = this._database.getClosestToPlayer(player);

    if (
      (business.owner && business.sellingPrice > 0) ||
      (!business.owner &&
        business.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(player, 'cash')))
    ) {
      const businessPrice: number = !business.owner ? business.firstPurchasePrice : business.sellingPrice;
      const businessPreviousOwner: string = business.owner;

      business.owner = global.exports['authentication'].getPlayerInfo(player, 'name');
      const result: boolean = await this._database.saveAsync(business.id);

      if (result) {
        global.exports['authentication'].setPlayerInfo(
          player,
          'cash',
          Number(global.exports['authentication'].getPlayerInfo(player, 'cash')) - businessPrice,
          false
        );
        global.exports['authentication'].setPlayerInfo(player, 'businesskeys', [
          ...(<number[]>global.exports['authentication'].getPlayerInfo(player, 'businesskeys')),
          business.id,
        ]);

        this.teleportIntoBusiness(player, business);
        Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:business-purchased`, player, business);
      } else {
        business.owner = businessPreviousOwner;
      }
    }
  }

  @EventListener({ eventName: `${Cfx.Server.GetCurrentResourceName()}:request-purchase-business` })
  public onRequestPurchase() {
    const business: Business = this._database.getClosestToPlayer(Cfx.source);
    if (
      (business.owner && business.sellingPrice > 0) ||
      (!business.owner &&
        business.firstPurchasePrice <= Number(global.exports['authentication'].getPlayerInfo(Cfx.source, 'cash')))
    ) {
      const businessPrice: number = !business.owner ? business.firstPurchasePrice : business.sellingPrice;

      // prettier-ignore
      Cfx.TriggerClientEvent(`${Cfx.Server.GetCurrentResourceName()}:show-dialog`, Cfx.source,
        {
          title: 'Purchase this business?',
          content: `Are you sure you want to purchase this business for $${StringFormatter.numberWithCommas(businessPrice)}?`,
          buttons: [{ title: 'Confirm' }],
          dialogId: 'purchase_unowned_business',
        } as UIDialog);
    }
  }

  protected syncWithClients(data: { player: number } | void): void {
    if (data && typeof data === 'object' && data?.player) {
      const playerName: string = global.exports['authentication'].getPlayerInfo(data?.player, 'name');
      const businessesOwnedByPlayer: Business[] = this._database.entities.filter(
        (business: Business) => business.owner === playerName
      );

      if (businessesOwnedByPlayer.length) {
        global.exports['authentication'].setPlayerInfo(
          data?.player,
          'businesskeys',
          businessesOwnedByPlayer.map((business: Business) => business.id)
        );
      }
    }
  }

  protected isEnterable(business: Business): boolean {
    return business.exitX !== 0.0 && business.exitY !== 0.0 && business.exitZ !== 0.0;
  }

  private teleportIntoBusiness(source: number, business: Business): void {
    Cfx.Server.SetEntityCoords(
      Cfx.Server.GetPlayerPed(source.toString()),
      business.exitX,
      business.exitY,
      business.exitZ,
      true,
      false,
      false,
      true
    );
    Cfx.Server.SetEntityRoutingBucket(Cfx.Server.GetPlayerPed(source.toString()), business.id);
    this._virtualWorlds.setPlayerVirtualWorld(source, business.id);
  }
}
