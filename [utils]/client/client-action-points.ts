import { ClientEntities } from './client-entities';
import { ActionPoint } from '../models/action-point.model';
import { calculateDistance, Delay } from '@core/utils';
import { Marker } from '@core/models/marker.model';
import { Command, EventListener, FiveMController } from '@core/decorators/armoury.decorators';
import { EVENT_DIRECTIONS } from '@core/decorators/event.directions';

@FiveMController()
export class ClientActionPoints extends ClientEntities {
    private chunkRadius: number = 75;

    private _actionPoints: { [posX: number]: { [posY: number]: ActionPoint[] } } = {};
    protected get actionPoints() {
        return this._actionPoints;
    }

    private _cachedPlayerPosition: [number, number] = [NaN, NaN];
    protected get cachedPlayerPosition(): [number, number] {
        return this._cachedPlayerPosition;
    }
    private _cachedPlayerRoundedPosition: [number, number] = [NaN, NaN];
    private _cachedIsPlayerInAnyVehicle: boolean = false;

    protected override createMarkers(markers: Marker[]): void {
        super.createMarkers(markers);

        this.createActionPoints(
            ...markers.map((marker) => ({
                id: `${GetCurrentResourceName()}_marker_${marker.pos[0]}_${marker.pos[1]}`,
                pos: marker.pos,
                range: marker.renderDistance,
                action: async () => {
                    if (marker.textureDict && !HasStreamedTextureDictLoaded(marker.textureDict)) {
                        RequestStreamedTextureDict(marker.textureDict, true);
                        
                        while (!HasStreamedTextureDictLoaded(marker.textureDict)) {
                            await Delay(100);
                        }
                    }
                    
                    DrawMarker(marker.marker, marker.pos[0], marker.pos[1], marker.pos[2], 0.0, 0.0, 0.0, marker.rotation?.[0] || 0.0, marker.rotation?.[1] || 0.0, marker.rotation?.[2] || 0.0, marker.scale, marker.scale, marker.scale, marker.rgba[0], marker.rgba[1], marker.rgba[2], marker.rgba[3], false, true, 2, false, marker.textureDict || null, marker.textureName || null, false);
                    
                    if (marker.underlyingCircle) {
                        DrawMarker(marker.underlyingCircle.marker, marker.pos[0], marker.pos[1], marker.pos[2] - 0.9, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, marker.underlyingCircle.scale, marker.underlyingCircle.scale, marker.underlyingCircle.scale, marker.underlyingCircle.rgba[0] || marker.rgba[0], marker.underlyingCircle.rgba[1] || marker.rgba[1], marker.underlyingCircle.rgba[2] || marker.rgba[2], marker.underlyingCircle.rgba[3] || marker.rgba[3], false, true, 2, false, null, null, false);
                    }
                }
            }))
        );
    }

    protected override clearMarkers(): void {
        this.markers.forEach((_marker) => {
            this.clearActionPoint(`${GetCurrentResourceName()}_marker_${_marker.pos[0]}_${_marker.pos[1]}`);
        });
        super.clearMarkers();
    }

    /** Creates one or multiple Action Points. Action points DO NOT include markers and/or blips.
     * They only contain the logic executed when a position is met.
    */
    protected createActionPoints(...actionPoints: ActionPoint[]): void {
        actionPoints.forEach((actionPoint) => {
            this.createActionPoint(actionPoint);
        });
    }

    protected createActionPoint(actionPoint: ActionPoint): void {
        const nearestX = this.roundToNearest(actionPoint.pos[0], this.chunkRadius);
        const nearestY = this.roundToNearest(actionPoint.pos[1], this.chunkRadius);

        if (!this._actionPoints[nearestX]) {
            this._actionPoints[nearestX] = {};
        }
        
        if (!this.actionPoints[nearestX][nearestY]) {
            this._actionPoints[nearestX][nearestY] = [];
        }

        this._actionPoints[nearestX][nearestY].push(actionPoint);
    }

    protected clearActionPoint(id: string): void {
        Object.keys(this._actionPoints).forEach((posX) => {
            Object.keys(this._actionPoints[posX]).forEach((posY) => {
                this._actionPoints[posX][posY] =
                    this._actionPoints[posX][posY].filter((_actionPoint) => _actionPoint.id != id)
            })
        });
    }

    protected clearActionPoints(): void {
        this._actionPoints = {};
        this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`);
    }

    protected actionPointExistsAtPosition(posX: number, posY: number, posZ: number): boolean {
        const roundedPosX = this.roundToNearest(posX, this.chunkRadius);
        const roundedPosY = this.roundToNearest(posY, this.chunkRadius);

        if (!this.actionPoints[roundedPosX] || !this.actionPoints[roundedPosX][roundedPosY]) {
            return;
        }

        if (this.actionPoints[roundedPosX][roundedPosY].find(
            (actionPoint: ActionPoint) =>
                actionPoint.pos[0] == posX
                && actionPoint.pos[1] == posY
                && actionPoint.pos[2] == posZ
            )
        ) {
            return true;
        }

        return false;
    }

    protected removeActionPoint(actionPoint: ActionPoint): void {
        if (this._actionPoints[this.roundToNearest(actionPoint.pos[0], this.chunkRadius)]?.[this.roundToNearest(actionPoint.pos[1], this.chunkRadius)]?.length) {
            this._actionPoints[this.roundToNearest(actionPoint.pos[0], this.chunkRadius)][this.roundToNearest(actionPoint.pos[1], this.chunkRadius)] =
            this._actionPoints[this.roundToNearest(actionPoint.pos[0], this.chunkRadius)][this.roundToNearest(actionPoint.pos[1], this.chunkRadius)].filter(
                (_actionPoint) => _actionPoint.id != actionPoint.id
            );
        }
    }

    @EventListener({ eventName: 'armoury:thread-triggerer', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
    protected onThreadTriggered(optimizationType: string): void {
        if (optimizationType === 'chunk-checker') {
            this._cachedPlayerPosition = <[number, number]>GetEntityCoords(PlayerPedId(), true);
            const [nearestX, nearestY] = [this.roundToNearest(this._cachedPlayerPosition[0], this.chunkRadius), this.roundToNearest(this._cachedPlayerPosition[1], this.chunkRadius)];

            if (this._cachedPlayerRoundedPosition[0] == nearestX && this._cachedPlayerRoundedPosition[1] == nearestY) {
                return;
            }

            this._cachedPlayerRoundedPosition = [nearestX, nearestY];
            this._cachedIsPlayerInAnyVehicle = IsPedInAnyVehicle(PlayerPedId(), false);

            if (
                this._actionPoints
                    [this._cachedPlayerRoundedPosition[0]]
                    ?.[this._cachedPlayerRoundedPosition[1]]?.length
            ) {
                this.addToTickUnique({
                    id: `${GetCurrentResourceName()}_actionpoints`,
                    function: (() => {
                        for (let i = 0; i < this._actionPoints[this._cachedPlayerRoundedPosition[0]]?.[this._cachedPlayerRoundedPosition[1]]?.length; i++) {
                            const _actionPoint = this._actionPoints[this._cachedPlayerRoundedPosition[0]]?.[this._cachedPlayerRoundedPosition[1]][i];

                            if (calculateDistance([_actionPoint.pos[0], _actionPoint.pos[1], _actionPoint.pos[2], this._cachedPlayerPosition[0], this._cachedPlayerPosition[1], _actionPoint.pos[2]]) <= (_actionPoint.range || 1.0) + (this._cachedIsPlayerInAnyVehicle && !_actionPoint.onfootOnly ? 5 : 0)) {
                                const actionPassed: boolean = (!_actionPoint.onceIf || _actionPoint.onceIf()) && (!_actionPoint.onfootOnly || !IsPedInAnyVehicle(PlayerPedId(), false)) && (!_actionPoint.inVehicleOnly || IsPedInAnyVehicle(PlayerPedId(), false));
                                if (actionPassed) {
                                    _actionPoint.action();
                                }

                                if ((_actionPoint.once || _actionPoint.onceIf) && actionPassed) {
                                    this._actionPoints[this._cachedPlayerRoundedPosition[0]]?.[this._cachedPlayerRoundedPosition[1]].splice(i, 1);
                                    i--;
                                }
                            }
                        }
                    })
                });
            } else {
                this.removeFromTick(`${GetCurrentResourceName()}_actionpoints`);
            }
        }
    }

    @Command({ suffix: `_${GetCurrentResourceName()}` })
    public debug_ActionPoints(): void {
        let totalActionPoints = 0;
        const currentAreaActionPoints = this.actionPoints[this.roundToNearest(this._cachedPlayerPosition[0], this.chunkRadius)]?.[this.roundToNearest(this._cachedPlayerPosition[1], this.chunkRadius)]?.length || 0;

        Object.keys(this.actionPoints).forEach((posX) => {
            Object.keys(this.actionPoints[posX]).forEach((posY) => {
                totalActionPoints += this.actionPoints[posX][posY].length;
            });
        });

        console.log(`Total action points: ${totalActionPoints}. Action points in this area: ${currentAreaActionPoints}`);
    }

    private roundToNearest(num: number, multiple: number): number {
        return Math.round(num / multiple) * multiple;
    }
}