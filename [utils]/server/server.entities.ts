import { ServerBase } from './server.base';

export class ServerEntities extends ServerBase {
    public removeClientsideVehicles(): void {
        TriggerClientEvent(`${GetCurrentResourceName()}:ARM_remove-vehicles`, -1);
    }
}
