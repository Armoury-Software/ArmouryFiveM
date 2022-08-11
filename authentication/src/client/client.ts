import { authenticationDTO } from '../shared/models/authentication.model';

let display = false;
let disableActions;

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

const free = () => {
  LeaveCursorMode();
  display = false;
};

free();

setTimeout(() => {
  blockActions();
}, 3000);

// setTimeout(() => { LeaveCursorMode(); }, 15000);

RegisterNuiCallbackType('authenticate');

on('__cfx_nui:authenticate', (data, cb) => {
  const response: authenticationDTO = data;
  TriggerServerEvent(
    'authentication:authenticate',
    response,
    globalThis.source
  );
  cb('ok');
});

onNet('authentication:success', () => {
  SendNuiMessage(
    JSON.stringify({
      type: 'dismiss',
    })
  );

  free();
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
