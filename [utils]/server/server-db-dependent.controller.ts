import { isJSON } from "../utils";
import { EventListener, Export } from '../decorators/armoury.decorators';
import { ServerController } from "./server.controller";

export class ServerDBDependentController<T extends { id: number }> extends ServerController {
    private _entities: T[] = [];
    protected get entities(): T[] {
        return this._entities;
    }

    private _playerToEntityBindings: Map<number, (number | string)[]> = new Map<number, (number | string)[]>();
    protected get playerToEntityBindings(): Map<number, (number | string)[]> {
        return this._playerToEntityBindings;
    }

    public constructor(protected dbTableName: string, loadAllAtStart: boolean = false) {
        super();

        if (loadAllAtStart) {
            this.loadDBEntities();
        }
    }

    @Export()
    protected getEntities(): T[] {
        return this._entities;
    }

    protected createEntity(entity: T, forceId?: number): Promise<T> {
        return (async () => {
            try {
                let entityProperties: string[] = this.getEntityProperties(entity);
                let entityValues: string[] = this.getEntityPropertiesValues(entity, entityProperties);

                if (forceId) {
                    entityProperties = ['id', ...entityProperties];
                    entityValues = [forceId.toString(), ...entityValues]
                }

                const id: any =
                    await global.exports['oxmysql'].insert_async(
                        `INSERT INTO \`${this.dbTableName}\` (${entityProperties.join(', ')}) VALUES (${Array(entityProperties.length).fill('?').join(', ')})`,
                        entityValues
                    );

                this._entities.push({ ...entity, id: forceId || id });
                this.syncWithClients();

                return forceId || id;
            }
            catch (error: any) {
                console.log(error);
                return null;
            }
        })();
    }

    protected removeEntity(entity: T): Promise<boolean> {
        return (async () => {
            try {
                const result: any =
                    await global.exports['oxmysql'].query_async(
                        `DELETE FROM \`${this.dbTableName}\` WHERE id = ?`,
                        [entity.id]
                    );

                this._entities = this._entities.filter((_entity: T) => _entity.id !== entity.id);
                this.syncWithClients();

                return !!result;
            }
            catch (error: any) {
                console.log(error);
                return false;
            }
        })();
    }

    protected saveDBEntityAsync(id: number): Promise<boolean> {
        return (async () => {
            try {
                const entity: T = this.getEntityByDBId(id);
                const updateKeys: string[] = this.getEntityProperties(entity);
                const updateValues: string[] = this.getEntityPropertiesValues(entity, updateKeys);
                const concatString: string = ' = ?, ';

                const result: number =
                    await global.exports['oxmysql'].update_async(
                        `UPDATE \`${this.dbTableName}\` SET ${updateKeys.join(concatString).concat(concatString).slice(0, -2)} WHERE id = ?`,
                        [...updateValues, entity.id]
                    );

                if (result) {
                    this.syncWithClients();
                }

                return result > 0;
            }
            catch (error: any) {
                console.log(error);
                return false;
            }
        })();
    }

    protected getEntityByDBId(id: number): T {
        return this._entities.find((_entity: T) => _entity.id === id);
    }

    protected async loadDBEntityFor(value: number | string, key: string = 'id', bindTo?: number): Promise<T | T[]> {
        const result: T[] = (await global.exports['oxmysql'].query_async(`SELECT * FROM \`${this.dbTableName}\` WHERE ${key} = ?`, [value])).map(
            (resultItem: any) => {
                Object.keys(resultItem).forEach((property: string) => {
                    resultItem[property] = JSON.parse(isJSON(resultItem[property].toString()) ? resultItem[property] : `"${resultItem[property]}"`, function(_k, v) { 
                        return (typeof v === "object" || isNaN(v)) ? v : Number(v); 
                    });
                });

                return resultItem;
            }
        );

        if (result?.length) {
            result.forEach((entity: T) => {
                this._entities.push(entity);

                if (bindTo) {
                    this.bindEntityToPlayerByEntityId(entity.id, bindTo);
                }
            });
            setTimeout(() => { this.syncWithClients(); }, 2000);

            return <T | T[]>(result?.length > 1 ? result : result[0]);
        }

        return null;
    }

    private loadDBEntities(): void {
        setImmediate(async () => {
            const result: T[] = (await global.exports['oxmysql'].query_async(`SELECT * FROM \`${this.dbTableName}\``, [])).map(
                (resultItem: any) => {
                    Object.keys(resultItem).forEach((property: string) => {
                        resultItem[property] = JSON.parse(isJSON(resultItem[property].toString()) ? resultItem[property] : `"${resultItem[property]}"`, function(_k, v) { 
                            return (typeof v === "object" || isNaN(v)) ? v : Number(v); 
                        });
                    });

                    return resultItem;
                }
            );

            if (result?.length) {
                this._entities = result;
                
                setTimeout(() => { this.syncWithClients(); }, 2000);
            }
        });
    }

    private getEntityProperties(entity: T): string[] {
        const keys: string[] = [];
        for (let key in entity) {
            if (key !== 'id') {
                keys.push(key);
            }
        }

        return keys;
    }

    private getEntityPropertiesValues(entity: T, properties: string[]): string[] {
        return properties.map((key: string) => {
            if (Array.isArray(entity[key])) {
                return JSON.stringify(entity[key]);
            }

            return entity[key].toString();
        });
    }

    protected syncWithClients(client?: number): void {
        // TODO: Probable performance issue cause. Entity updates should be sent to clients only for a specific property, so they don't need to wipe ALL data and rewrite it back.
        TriggerClientEvent(`${GetCurrentResourceName()}:db-send-entities`, client || -1, this.entities);
    }

    protected bindEntityToPlayer(entity: T, playerId: number): void {
        if (this.entities.includes(entity)) {
            this.bindEntityToPlayerByEntityId(entity.id, playerId);
        }
    }

    protected bindEntityToPlayerByEntityId(id: number | string, playerId: number): void {
        const entityExists: boolean = this._entities.some((entity: T) => entity.id === id);

        if (entityExists) {
            if (this._playerToEntityBindings.has(playerId)) {
                this._playerToEntityBindings.set(playerId, [...this._playerToEntityBindings.get(playerId), id]);
            } else {
                this._playerToEntityBindings.set(playerId, [id]);
            }
        }
    }

    protected onBoundEntityDestroyed(entity: T, boundPlayer: number): void { }

    @EventListener()
    public onPlayerAuthenticate(playerId: number, _player: any): void {
        if (this._entities.length) {
            this.syncWithClients(playerId);
        }
    }

    @EventListener()
    public onPlayerDisconnect(): void {
        if (this._playerToEntityBindings.has(source)) {
            const bindings: (number | string)[] =
                this._playerToEntityBindings.has(source)
                    ? this._playerToEntityBindings.get(source)
                    : [];
            
            bindings.forEach((entityId: number | string) => {
                const entityBoundToPlayer: T = this._entities.find((entity: T) => entity.id === entityId);

                if (entityBoundToPlayer) {
                    this.onBoundEntityDestroyed(entityBoundToPlayer, source);
                    this._entities.splice(this._entities.indexOf(entityBoundToPlayer), 1);
                }
            });

            this._playerToEntityBindings.delete(source);
        }
    }
}