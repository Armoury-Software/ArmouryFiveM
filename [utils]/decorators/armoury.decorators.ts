import { DEFAULT_DECORATORS } from './decorators.defaults';
import { EVENT_DIRECTIONS } from './event.directions';

const eventListeners: Map<{ new (...args: any[]): any }, [string, string, EVENT_DIRECTIONS][]> = new Map<{ new (...args: any[]): any }, [string, string, EVENT_DIRECTIONS][]>();
const exportRegisterers: Map<{ new (...args: any[]): any }, string[]> = new Map<{ new (...args: any[]): any }, string[]>();
const commandRegisterers: Map<{ new (...args: any[]): any }, [string, number][]> = new Map<{ new (...args: any[]): any }, [string, number][]>();

export function FiveMController() {
  return function _FiveMController<T extends {new(...args: any[]): {}}>(constr: T){
    return class extends constr {
      constructor(...args: any[]) {
        super(...args);

        if (eventListeners.has(constr)) {
          eventListeners.get(constr).forEach(([func, eventName, direction]: [string, string, EVENT_DIRECTIONS]) => {
            switch (direction) {
              case EVENT_DIRECTIONS.CLIENT_TO_CLIENT: {
                on(eventName, super[func].bind(this));
                break;
              }
              default: {
                onNet(eventName, super[func].bind(this));
                break;
              }
            }
          });
        }

        if (exportRegisterers.has(constr)) {
          exportRegisterers.get(constr).forEach((func: string) => {
            exports(func, super[func].bind(this));
          });
        }

        if (commandRegisterers.has(constr)) {
          commandRegisterers.get(constr).forEach(([func, adminLevelRequired]: [string, number]) => {
            // exports(func, super[func].bind(this));
            RegisterCommand(
              func.toLowerCase(),
              (source: number, args: any[], _raw: boolean) => {
                  if (Number(global.exports['authentication'].getPlayerInfo(source, 'adminLevel')) < adminLevelRequired) {
                      // TODO: Add error chat message OR some kind of visual notice here
                      return;
                  }
  
                  super[func].call(this, source, args, _raw);
              },
              false
          );
          });
        }
      }
    }
  }
}

export function EventListener(data?: { eventName?: string, direction?: EVENT_DIRECTIONS }) {
  return function (
    _target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    const eventName: string = DEFAULT_DECORATORS[propertyKey] || data?.eventName;
    const direction: EVENT_DIRECTIONS = data?.direction || EVENT_DIRECTIONS.CLIENT_TO_SERVER;

    if (eventName?.length) {
      if (!eventListeners.has(_target.constructor)) {
        eventListeners.set(_target.constructor, []);
      }

      if (!eventListeners.get(_target.constructor).some(([func, _name, _dir]) => func === propertyKey)) {
        eventListeners.get(_target.constructor)!.push([propertyKey, eventName, direction]);
      }
    } else {
      console.error(`${propertyKey} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`);
    }
  };
}

export function Export() {
  return function (
    _target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    if (!exportRegisterers.has(_target.constructor)) {
      exportRegisterers.set(_target.constructor, []);
    }

    if (!exportRegisterers.get(_target.constructor).some((_propertyKey: string) => _propertyKey === propertyKey)) {
      exportRegisterers.get(_target.constructor)!.push(propertyKey);
    }
  }
}

export function Command(adminLevelRequired: number = 0) {
  return function (
    _target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    if (!commandRegisterers.has(_target.constructor)) {
      commandRegisterers.set(_target.constructor, []);
    }

    if (!commandRegisterers.get(_target.constructor).some(([_propertyKey, _adminLevelRequired]: [string, number]) => _propertyKey === propertyKey)) {
      commandRegisterers.get(_target.constructor)!.push([propertyKey, adminLevelRequired]);
    }
  }
}
