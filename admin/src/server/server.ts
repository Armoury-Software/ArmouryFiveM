import 'reflect-metadata';
import { ReflectiveInjector } from 'injection-js';
import { Server } from './controllers/server.controller';

const injector = ReflectiveInjector.resolveAndCreate([Server]);
injector.get(Server);
