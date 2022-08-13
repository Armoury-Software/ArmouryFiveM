import { ClientHudController } from './client-hud.controller';

export class ClientController extends ClientHudController {
  protected translationFile?: { [key: string]: string };

  private _translationLanguage: string = 'en';
  protected get translationLanguage(): string {
    return this._translationLanguage;
  }

  protected translate(key: string, params?: { [key: string]: string }): string {
    let content: string = this.translationFile[this._translationLanguage][key];

    if (params) {
      Object.keys(params).forEach((param) => {
        content = content.replace(`{${param}}`, params[param]);
      });
    }

    return content;
  }

  protected setTranslationLanguage(language: string): void {
    this._translationLanguage = language;
  }
}
