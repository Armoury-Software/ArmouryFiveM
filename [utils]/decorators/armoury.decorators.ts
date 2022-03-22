import { DEFAULT_DECORATORS } from './decorators.defaults';
import { EVENT_DIRECTIONS } from './event.directions';

export function EventListener(data?: { eventName?: string, direction?: EVENT_DIRECTIONS }) {
  return function (
    _target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    const eventName: string = DEFAULT_DECORATORS[propertyKey] || data?.eventName;
    const direction: EVENT_DIRECTIONS = data?.direction || EVENT_DIRECTIONS.CLIENT_TO_SERVER;

    if (eventName?.length) {
      switch (direction) {
        case EVENT_DIRECTIONS.CLIENT_TO_CLIENT: {
          on(eventName, _descriptor.value);
          break;
        }
        default: {
          onNet(eventName, _descriptor.value);
          break;
        }
      }
    } else {
      console.error(`${propertyKey} is not recognized as a default event, thus this listener won't work. Please use the eventName property inside the data parameter.`);
    }
  };
}
