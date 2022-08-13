import { Delay } from '@core/utils';
import { authenticationDTO } from '../shared/models/authentication.model';

let currentAuthenticationCamera: number;
let display = false;
let disableActions;

const showAuthenticationScreen = () => {
  currentAuthenticationCamera = CreateCam('DEFAULT_SCRIPTED_CAMERA', true);
  SetCamCoord(
    currentAuthenticationCamera,
    879.82177734375,
    -1930.485595703125,
    96.08704376220703
  );
  PointCamAtCoord(
    currentAuthenticationCamera,
    1404.57763671875,
    -1877.9915771484376,
    72.19271850585938
  );
  SetCamActive(currentAuthenticationCamera, true);
  RenderScriptCams(true, false, 0, true, true);
  DisplayRadar(false);

  setTimeout(() => {
    emit(
      'armoury-overlay:play-background-music',
      'https://armoury.ro/fivem/ambient/authentication.mp3',
      0.05
    );
  }, 1000);
};

const blockActions = () => {
  EnterCursorMode();
  SetNuiFocus(true, true);
  SetNuiFocusKeepInput(false);
  display = true;

  disableActions = setTick(async () => {
    DisableControlAction(0, 1, display);
    DisableControlAction(0, 2, display);
    DisableControlAction(0, 142, display);
    DisableControlAction(0, 18, display);
    DisableControlAction(0, 322, display);
    DisableControlAction(0, 106, display);

    if (!display) {
      clearTick(disableActions);
      SetNuiFocus(false, false);
    }
  });
};

const free = (clearCamera?: boolean) => {
  if (clearCamera) {
    RenderScriptCams(false, false, 0, true, true);
    SetCamActive(currentAuthenticationCamera, false);
    currentAuthenticationCamera = NaN;
  }

  LeaveCursorMode();
  display = false;
  StartAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE');
};

free();
showAuthenticationScreen();

setTimeout(() => {
  blockActions();
}, 3000);

// setTimeout(() => { LeaveCursorMode(); }, 15000);

RegisterNuiCallbackType('authenticate');

on('__cfx_nui:authenticate', (data, cb) => {
  const response: authenticationDTO = data;
  TriggerServerEvent('authentication:authenticate', response);
  cb('ok');
});

onNet(`${GetCurrentResourceName()}:fade-out-in`, async () => {
  DoScreenFadeOut(500);
  await Delay(1500);
  DoScreenFadeIn(500);
});

onNet('authentication:account-success-client', () => {
  SendNuiMessage(
    JSON.stringify({
      type: 'dismiss',
    })
  );

  free(true);
});

onNet('authentication:spawn-player', (playerPosition: number[]) => {
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
    SetEntityHeading(PlayerPedId(), Number(playerPosition[3]));
  }

  DisplayRadar(true);
});

onNet('authentication:success', () => {
  StopAudioScene('DLC_MPHEIST_TRANSITION_TO_APT_FADE_IN_RADIO_SCENE');
  emit('armoury-overlay:stop-background-music');
});

onNet('authentication:register-error', () => {
  SendNuiMessage(
    JSON.stringify({
      type: 'error',
      message: 'Email already in use.',
    })
  );
});

onNet('authentication:login-error', () => {
  SendNuiMessage(
    JSON.stringify({
      type: 'error',
      message: 'Email and password combination is incorrect.',
    })
  );
});
