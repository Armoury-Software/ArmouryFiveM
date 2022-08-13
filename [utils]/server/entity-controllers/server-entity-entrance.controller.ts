import { isPlayerInRangeOfPoint } from '../../utils';
import { ServerDBDependentController } from '../server-db-dependent.controller'

export class ServerEntityWithEntranceController<T extends { id: number, entranceX: number, entranceY: number, entranceZ: number, exitX: number, exitY: number, exitZ: number }> extends ServerDBDependentController<T> {
    protected getClosestEntityOfSameTypeToPlayer(player: number): T {
        return this.getClosestEntityOfSameTypeExitToPlayer(player) || this.getClosestEntityOfSameTypeEntranceToPlayer(player);
    }

    protected getClosestEntityOfSameTypeEntranceToPlayer(source: number): T {
        // TODO: Replace here to actually get the closest, not the first one in the range
        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);
        const entity: T = this.entities.find((_entity: T) => isPlayerInRangeOfPoint(playerPosition[0], playerPosition[1], playerPosition[2], _entity.entranceX, _entity.entranceY, _entity.entranceZ, 3.0));

        return entity || null;
    }

    protected getClosestEntityOfSameTypeExitToPlayer(source: number): T {
        const virtualWorld: number = this.getPlayerVirtualWorld(source) || 0;
        const entity: T = this.getEntityByDBId(virtualWorld);
        const playerPosition: number[] = GetEntityCoords(GetPlayerPed(source), true);

        // TODO: Replace here to actually get the closest, not the first one in the range
        if (entity && isPlayerInRangeOfPoint(playerPosition[0], playerPosition[1], playerPosition[2], entity.exitX, entity.exitY, entity.exitZ, 3.0)) {
            return entity;
        }

        return null;
    }
}