import { ClientActionPoints } from './client-action-points';

export class ClientHudController extends ClientActionPoints {
    private timeBetweenFeeds: number = 8 * 1000;

    protected addToFeed(...texts: string[]): void {
      texts.forEach((text: string, index: number) => {
        setTimeout(
          () => {
            BeginTextCommandThefeedPost('STRING');
            AddTextComponentSubstringPlayerName(text);
            EndTextCommandThefeedPostTicker(false, true);
          },
          index * this.timeBetweenFeeds
        );
      });
    }
}