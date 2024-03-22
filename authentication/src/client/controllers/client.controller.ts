import { Controller, Delay, EventListener, UIListener } from '@armoury/fivem-framework';
import { type IAuthenticationDTO } from '@shared/models/authentication.model';

@Controller()
export class Client {
  private authCamera: number;
  private display: boolean = false;
  private disableActions: number;

  // TODO: Do this in $onInit (?)
  public constructor() {
    this.free();
    this.showAuthScreen();

    setTimeout(() => {
      this.blockActions();
    }, 3000);
  }

  private showAuthScreen() {
    this.authCamera = Cfx.Client.CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
    Cfx.Client.SetCamCoord(this.authCamera, 879.82177734375, -1930.485595703125, 96.08704376220703);
    Cfx.Client.PointCamAtCoord(this.authCamera, 1404.57763671875, -1877.9915771484376, 72.19271850585938);
    Cfx.Client.SetCamActive(this.authCamera, true);
    Cfx.Client.RenderScriptCams(true, false, 0, true, true);
    Cfx.Client.DisplayRadar(false);

    setTimeout(() => {
      Cfx.emit('armoury-overlay:play-background-music', 'https://armoury.ro/fivem/ambient/authentication.mp3', 0.05);
    }, 1000);
  }

  private blockActions() {
    Cfx.Client.EnterCursorMode();
    Cfx.Client.SetNuiFocus(true, true);
    Cfx.Client.SetNuiFocusKeepInput(false);
    this.display = true;

    this.disableActions = Cfx.setTick(async () => {
      Cfx.Client.DisableControlAction(0, 1, this.display);
      Cfx.Client.DisableControlAction(0, 2, this.display);
      Cfx.Client.DisableControlAction(0, 142, this.display);
      Cfx.Client.DisableControlAction(0, 18, this.display);
      Cfx.Client.DisableControlAction(0, 322, this.display);
      Cfx.Client.DisableControlAction(0, 106, this.display);

      if (!this.display) {
        Cfx.clearTick(this.disableActions);
        Cfx.Client.SetNuiFocus(false, false);
      }
    });
  }

  private free(clearCamera?: boolean) {
    if (clearCamera) {
      Cfx.Client.RenderScriptCams(false, false, 0, true, true);
      Cfx.Client.SetCamActive(this.authCamera, false);
      this.authCamera = NaN;
    }

    Cfx.Client.LeaveCursorMode();
    this.display = false;
    Cfx.Client.StartAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE');
  }

  @UIListener({ eventName: 'authenticate' })
  public onNuiAuthenticate(data: IAuthenticationDTO) {
    Cfx.TriggerServerEvent(`${Cfx.Server.GetCurrentResourceName()}:authenticate`, data);
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:fade-out-in` })
  public async onShouldDoFadeOutIn() {
    Cfx.Client.DoScreenFadeOut(500);
    await Delay(1500);
    Cfx.Client.DoScreenFadeIn(500);
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:account-success-client` })
  public onAuthenticationSuccess() {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'dismiss',
      })
    );

    this.free(true);
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:spawn-player` })
  public onSpawn(playerPosition: number[]) {
    if (playerPosition) {
      globalThis.exports.spawnmanager.setAutoSpawnCallback(() => {
        global.exports['spawnmanager'].spawnPlayer({
          x: playerPosition[0],
          y: playerPosition[1],
          z: playerPosition[2],
          skipFade: false,
        });
      });
      global.exports['spawnmanager'].forceRespawn();
    } else {
      global.exports['spawnmanager'].spawnPlayer();
    }

    if (playerPosition[3]) {
      Cfx.Client.SetEntityHeading(Cfx.Client.PlayerPedId(), Number(playerPosition[3]));
    }

    Cfx.Client.DisplayRadar(true);
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:success` })
  public onCharacterAuthenticationSucccess() {
    Cfx.Client.StopAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE');
    Cfx.Client.emit('armoury-overlay:stop-background-music');
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:register-error` })
  public onRegisterError() {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'error',
        message: 'Email already in use.',
      })
    );
  }

  @EventListener({ eventName: `${Cfx.Client.GetCurrentResourceName()}:login-error` })
  public onLoginError() {
    Cfx.Client.SendNuiMessage(
      JSON.stringify({
        type: 'error',
        message: 'Email and password combination is incorrect.',
      })
    );
  }
}
