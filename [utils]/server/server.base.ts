export class ServerBase {
    public constructor() {
        this.assignServerBaseListeners();
    }

    // TODO: Remove this. We have created a brand new cool decorator for this
    protected RegisterAdminCommand(commandName: string, adminLevelRequired: number, handlerFunction: Function, restricted: boolean) {
        RegisterCommand(
            commandName,
            (source: number, args: any[], _raw: boolean) => {
                if (Number(global.exports['authentication'].getPlayerInfo(source, 'adminLevel')) < adminLevelRequired) {
                    // TODO: Add error chat message OR some kind of visual notice here
                    return;
                }

                handlerFunction(source, args, _raw);
            },
            restricted
        );
    }

    private assignServerBaseListeners(): void {
        onNet(`${GetCurrentResourceName()}:set-client-routing-bucket`, (source: number, routingBucket: number) => {
            if (this.routingBucketCondition(source, routingBucket)) {
                SetEntityRoutingBucket(source, routingBucket);
            }
        });
    }

    protected routingBucketCondition: (source: number, routingBucket: number) => boolean = (source: number, routingBucket: number) => true;
}