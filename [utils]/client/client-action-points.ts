import { ClientEntities } from './client-entities';
import { ActionPoint } from '../models/action-point.model';
import { isPlayerInRangeOfPoint } from '../utils';

export class ClientActionPoints extends ClientEntities {
    private _actionPoints: ActionPoint[] = [];
    protected get actionPoints() {
        return this._actionPoints;
    }

    /** Creates one or multiple Action Points. Action points DO NOT include markers and/or blips.
     * They only contain the logic executed when a position is met.
    */
    protected createActionPoints(...actionPoints: ActionPoint[]): void {
        this._actionPoints.push(...actionPoints);
        this.refreshActionPoints();
    }

    protected clearActionPoints(): void {
        this._actionPoints = [];
        this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`);
    }

    protected removeActionPoint(actionPoint: ActionPoint): void {
        this._actionPoints = this._actionPoints.filter((_actionPoint: ActionPoint) => !(actionPoint.pos[0] === _actionPoint.pos[0] && actionPoint.pos[1] === _actionPoint.pos[1] && actionPoint.pos[2] === _actionPoint.pos[2]));
    
        if (!this._actionPoints.length) {
            this.clearActionPoints();
        }
    }

    protected refreshActionPoints(): void {
        this.addToTickUnique({
            id: `${GetCurrentResourceName()}_actionpoints`,
            function: () => {
                const position: number[] = GetEntityCoords(GetPlayerPed(-1), true);
                let actionPointsToRemove: ActionPoint[] = [];

                this._actionPoints.forEach((actionPoint: ActionPoint) => {
                    if (isPlayerInRangeOfPoint(position[0], position[1], position[2], actionPoint.pos[0], actionPoint.pos[1], actionPoint.pos[2], 1 * (IsPedInAnyVehicle(GetPlayerPed(-1), false) ? 4: 1))) {
                        actionPoint.action();

                        if (actionPoint.once) {
                            actionPointsToRemove.push(actionPoint);
                        }
                    }
                });

                if (actionPointsToRemove.length > 0) {
                    actionPointsToRemove.forEach((actionPoint: ActionPoint) => {
                        this._actionPoints.splice(this._actionPoints.indexOf(actionPoint), 1);
                    });

                    actionPointsToRemove = [];
                }
            }
        });
    }
}