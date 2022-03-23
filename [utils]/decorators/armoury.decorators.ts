import { DEFAULT_DECORATORS } from './decorators.defaults';
import { EVENT_DIRECTIONS } from './event.directions';

const eventListeners: [string, string, EVENT_DIRECTIONS][] = [];
const exportRegisterers: string[] = [];

export function FiveMController() {
  return function _FiveMController<T extends {new(...args: any[]): {}}>(constr: T){
    return class extends constr {
      constructor(...args: any[]) {
        super(...args);

        eventListeners.forEach(([func, eventName, direction]: [string, string, EVENT_DIRECTIONS]) => {
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

        exportRegisterers.forEach((func: string) => {
          exports(func, super[func].bind(this));
        });
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
      eventListeners.push(
        [propertyKey, eventName, direction]
      );
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
    exportRegisterers.push(propertyKey);
  }
}
