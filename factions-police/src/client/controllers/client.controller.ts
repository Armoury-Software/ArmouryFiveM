import { ClientFactionController } from '@core/client/client-faction.controller';
import { FiveMController } from '@core/decorators/armoury.decorators';

import { i18n } from '../i18n';

@FiveMController({ translationFile: i18n })
export class Client extends ClientFactionController {
  public constructor() {
    super();

    setTimeout(() => {
      this.setupFactionIndividualBlip({
        id: 526,
        color: 0,
        title: this.translate('police_department'),
        pos: [],
      });
    });
  }
}
