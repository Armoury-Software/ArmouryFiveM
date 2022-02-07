import { isJSON, isPlayerInRangeOfPoint } from "../utils";
import { ServerController } from "./server.controller";

export class ServerDBDependentController<T extends { id: number }> extends ServerController {
    private _entities: T[] = [];
    protected get entities(): T[] {
        return this._entities;
    }

    public constructor(protected dbTableName: string) {
        super();

        this.loadDBEntities();
        this.assignDBEntityCommunicationListeners();
    }

    protected createEntity(entity: T): Promise<T> {
        return (async () => {
            try {
                const entityProperties: string[] = this.getEntityProperties(entity);
                const entityValues: string[] = this.getEntityPropertiesValues(entity, entityProperties);

                const id: any =
                    await global.exports['oxmysql'].insert_async(
                        `INSERT INTO \`${this.dbTableName}\` (${entityProperties.join(', ')}) VALUES (${Array(entityProperties.length).fill('?').join(', ')})`,
                        entityValues
                    );

                this._entities.push({ ...entity, id });
                this.syncWithClients();

                return id;
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

    private assignDBEntityCommunicationListeners(): void {
        onNet('authentication:player-authenticated', (playerAuthenticated: number) => {
            if (this._entities.length) {
                this.syncWithClients(playerAuthenticated);
            }
        });
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
}