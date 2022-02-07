export class clientHelpers {
    public static getPlayerInfo = (global: any, stat: string) => {
        return global.GetConvar(`${global.GetPlayerServerId(global.PlayerId())}_PI_${stat}`, '-1');
    }
}