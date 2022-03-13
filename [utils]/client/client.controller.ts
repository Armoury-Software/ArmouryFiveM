import { isJSON } from '../utils';
import { ClientHudController } from './client-hud.controller';

export class ClientController extends ClientHudController {
    protected getPlayerInfo(stat: string): string | number | number[] | string[] | Object {
        let value: string | number | number[] | string[] = GetConvar(`${global.GetPlayerServerId(global.PlayerId())}_PI_${stat}`, '-1');

        if (isJSON(value.toString())) {
            value = JSON.parse(value.toString(), function(_k, v) { return (typeof v === "object" || isNaN(v)) ? v : Number(v); });
        }

        return value;
    }
}
