import { Inject } from 'injection-js';
import { Controller, EventListener } from '@armoury/fivem-framework';
import { ServerBusinessService, IBusinessInteractRequest } from '@armoury/fivem-roleplay-gamemode';

@Controller()
export class Server {
    public constructor(@Inject(ServerBusinessService) private readonly _business: ServerBusinessService) {
        this._business.onPlayerInteractRequest$.subscribe(this.onPlayerInteractRequest.bind(this));
    }

    // TODO: Revisit after inventory refactor
    private onPlayerInteractRequest(request: IBusinessInteractRequest) {
        // Cfx.emit(
        //     'inventory:client-inventory-request',
        //     request.by,
        //     ItemConstructor.withCustomizations(
        //         EXTERNAL_INVENTORY_MAPPINGS(this.translationLanguage)[this._businessUsableName],
        //         {
        //             topLeft: () => '',
        //             bottomRight: (value: Item) =>
        //                 `$${numberWithCommas(BASE_ITEM_PRICES[value.image] || 100)}`,
        //             value: (value: Item) => BASE_ITEM_PRICES[value.image],
        //         }
        //     )
        // );
    }

    // TODO: Revisit after inventory refactor
    @EventListener({ eventName: 'inventory:client-receive-item' })
    public onPlayerReceiveItem(/*item: Item*/) {
    //     const player = Cfx.source;
    //     const business = global.exports['businesses'].getClosestBusiness(player);
    // 
    //     if (business && business.name === '24/7') {
    //         Cfx.emit(`inventory:show-purchase-dialog`, player, {
    //             myMoney: Number(
    //                 Cfx.exports['authentication'].getPlayerInfo(player, 'cash')
    //             ),
    //             item,
    //         });
    //     }
    }

    // TODO: Revisit after inventory refactor
    @EventListener({ eventName: 'inventory:client-confirm-purchase' })
    public onPlayerConfirmPurchase(/*data: { item: Item; amount: number }*/) {
        //const player = Cfx.source;
        //const business =
        //    Cfx.exports['businesses'].getClosestBusiness(player);
        //
        //if (business && business.name === '24/7') {
        //    const playerMoney: number = Number(
        //        Cfx.exports['authentication'].getPlayerInfo(player, 'cash')
        //    );
        //    const itemTotalPrice: number =
        //        BASE_ITEM_PRICES[data.item.image] * data.amount;
        //
        //    if (playerMoney < itemTotalPrice) {
        //        return;
        //    }
        //
        //    Cfx.exports['inventory'].givePlayerItem(
        //        player,
        //        data.item,
        //        data.amount
        //    );
        //
        //    Cfx.exports['authentication'].setPlayerInfo(
        //        player,
        //        'cash',
        //        playerMoney - itemTotalPrice
        //    );
        //}
    }
}
