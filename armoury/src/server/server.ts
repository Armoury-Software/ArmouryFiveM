var fs = require('fs');

RegisterCommand('pos', (source: number, args: string[], raw: boolean) => {
  let position: number[] = [];
  let rotation: number[] = [];

  if (GetVehiclePedIsIn(GetPlayerPed(source), true) !== 0) {
    position = GetEntityCoords(GetVehiclePedIsIn(GetPlayerPed(source), false), true);
    rotation = GetEntityRotation(GetVehiclePedIsIn(GetPlayerPed(source), false), 2);
  } else {
    position = GetEntityCoords(GetPlayerPed(source), true);
    rotation = GetEntityRotation(GetPlayerPed(source), 2);
  }
  const computedString: string = `${position.toString()},${rotation.toString()}`;

  console.log(`Source position is ${computedString}`);

  fs.appendFile('savedpositions.txt', `\n${computedString} ${args.slice().shift()}`, () => { });
}, false);

RegisterCommand('tp', (source: number, args: string[], _raw: boolean) => {
  switch (args[0]) {
      case 'trucker': {
          SetEntityCoords(GetPlayerPed(source), 124.60220336914062, -2682.474609375, 10.229248046875, true, false, false, false);
      }
  }
}, false);
