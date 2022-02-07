export class ClientBase {
    private tickInstance: number = null;
    private tickFunctions: { id: string, function: Function }[] = [];

    protected routingBucket: number = 0;

    public constructor() {
        this.assignBaseListeners();
    }

    /** ATTENTION! The ID of a tick function needs to be UNIQUE! */
    protected addToTick(...functions: { id: string, function: Function }[]): void {
        functions.forEach(
            (func: { id: string, function: Function }) => {
                if (this.tickFunctions.findIndex((_func: { id: string, function: Function }) => _func.id === func.id) !== -1) {
                    console.error(`[ClientBase]: A tick function with the id ${func.id} already exists in the stack! The newly added tick function will not be executed.`);
                }
            }
        );

        this.tickFunctions.push(...functions);
        this.removeTickDuplicates();
        this.refreshTicks();
    }

    protected addToTickUnique(...functions: { id: string, function: Function }[]): void {
        functions.forEach((func: { id: string, function: Function }) => {
            this.removeFromTick(func.id);
        })

        this.addToTick(...functions);
    }

    /** Removes tick function with the provided id. */
    protected removeFromTick(id: string): void {
        this.tickFunctions = this.tickFunctions.filter((func: { id: string, function: Function }) => func.id != id);
    }

    private refreshTicks(): void {
        if (this.tickInstance) {
            clearTick(this.tickInstance);
            this.tickInstance = null;
        }

        if (this.tickFunctions.length > 0) {
            this.tickInstance = setTick(async () => {
                if (!this.tickFunctions.length) {
                    clearTick(this.tickInstance);
                    this.tickInstance = null;
                    return;
                }

                this.tickFunctions.forEach((tick: { id: string, function: Function }) => {
                    tick.function();
                });
            });
        }
    }

    private removeTickDuplicates(): void {
        this.tickFunctions = this.tickFunctions.filter(
            (func: { id: string, function: Function }) =>
                this.tickFunctions.findIndex((_func: { id: string, function: Function }) => _func.id == func.id) == this.tickFunctions.indexOf(func)
        );
    }

    private assignBaseListeners(): void {
        onNet(`${GetCurrentResourceName()}:set-routing-bucket`, (routingBucket: number) => {
            this.routingBucket = routingBucket;
        });
    }

    protected setEntityRoutingBucket(routingBucket: number): void {
        TriggerServerEvent(`${GetCurrentResourceName()}:set-client-routing-bucket`, routingBucket);
        this.routingBucket = routingBucket;
    }
}