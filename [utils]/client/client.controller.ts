import { ClientActionPoints } from './client-action-points';

export class ClientController extends ClientActionPoints {
    protected getPlayerInfo(stat: string): string | number[] | string[] {
        let value: string | number[] | string[] = GetConvar(`${global.GetPlayerServerId(global.PlayerId())}_PI_${stat}`, '-1');

        if (value.toString().includes(';ARM;,')) {
            value = value.split(';ARM;,');
        }

        return value;
    }
}
