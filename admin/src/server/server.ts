import 'reflect-metadata';
import { Injectable, ReflectiveInjector } from 'injection-js';
import { ClientActionPointsService } from '@armoury/fivem-framework';
import { Server } from './controllers/server.controller';

@Injectable()
export class Test {
  public constructor() {
    console.log('Test constructor called!');
  }

  public doSomething(): void {
    console.log('Test is doing something!');
  }
}

const injector = ReflectiveInjector.resolveAndCreate([Server, Test]);
const server = injector.resolveAndInstantiate(Server);
// console.log(i.get(ClientActionPointsService) instanceof ClientActionPointsService);
// console.log(i.get(ClientActionPointsService), i.get(Server));
