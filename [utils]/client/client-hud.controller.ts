import { ClientActionPoints } from './client-action-points';

export class ClientHudController extends ClientActionPoints {
    protected addToFeed(feedItemLength: number = 8000, ...texts: string[]): void {
      texts.forEach((text: string, index: number) => {
        setTimeout(
          () => {
            BeginTextCommandThefeedPost('STRING');
            AddTextComponentSubstringPlayerName(text);
            EndTextCommandThefeedPostTicker(false, true);
          },
          index * feedItemLength
        );
      });
    }
}