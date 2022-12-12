---
layout: default
title: Events
parent: Framework
nav_order: 1
---

## Events
Events are used in order to establish communication between resources or scripts - for example, one resource communicating with another resource, or one server script file communicating with a client script file from the same resource.
<br>The Armoury Framework recognizes functions annotated with the `@EventListener()` decorator and automatically marks them as event listeners.

The `@EventListener()` decorator accepts a configuration object with a few properties which define the functionality of our EventListener:
<table>
  <tr>
    <th>Property</th>
    <th>Description</th>
    <th>Default Value</th>
  </tr>
  <tr>
    <td>eventName</td>
    <td>Name of the event to listen to</td>
    <td>Name of the function which the decorator has been added to</td>
  </tr>
  <tr>
    <td>direction</td>
    <td>
      Decides whether the EventListener listens to triggers from another script type (client/server) or not
      <br><br>
      <strong>Values:</strong>
      <br>SERVER_TO_SERVER - Only listens when defined inside a server script, and triggered from a server script
      <br>SERVER_TO_CLIENT - Only listens when defined inside a server script, and triggered from a client script
      <br>CLIENT_TO_SERVER - Only listens when defined inside a client script, and triggered from a server script
      <br>CLIENT_TO_CLIENT - Only listens when defined inside a client script, and client from a server script
    </td>
    <td>
      By default: listens for cross-script communication (server-to-client or client-to-server)
      <br>* <i>Can be omitted</i>
    </td>
  </tr>
</table>

### [](#listening-for-events)Listening for events: Basic example
```ts
// server.controller.ts
@EventListener({ eventName: 'say-hello' })
public onSayHello(): void {
  console.log('Hello!');
}
```

### [](#triggering-events)Triggering events: Basic example
```ts
// client.controller.ts
TriggerServerEvent('say-hello');
```

---

## [](#special-cases)Special cases
Sometimes you need to trigger an event from a client script and listen for it in another client script, or sometimes you might need to trigger an event from a server script and listen for it in another server script. In order to do this, you might need to specify the event direction and trigger the event accordingly.

### [](#server-to-client)Event Communication: Server to Client
When establishing event communication between a server script and a client script, the `EventListener()` does not necessarily need to specify an event direction - but you **need** to trigger the event accordingly:

```ts
// server.controller.ts
TriggerClientEvent('say-hello');
```

```ts
// client.controller.ts
@EventListener({ eventName: 'say-hello' })
public onSayHello(): void {
  console.log('Hello!');
}
```

### [](#client-to-server)Event Communication: Client to Server
When establishing event communication between a client script and a server script, the `EventListener()` does not necessarily need to specify an event direction - but you **need** to trigger the event accordingly:

```ts
// client.controller.ts
TriggerServerEvent('say-hello');
```

```ts
// server.controller.ts
@EventListener({ eventName: 'say-hello' })
public onSayHello(): void {
  console.log('Hello!');
}
```

### [](#server-to-server)Event Communication: Server to Server
When establishing event communication between a server script and another server script, the `EventListener()` **needs** to specify an event direction and you **need** to trigger the event accordingly:

```ts
// server_1.controller.ts
emit('say-hello');
```

```ts
// server_2.controller.ts
@EventListener({ eventName: 'say-hello', direction: EVENT_DIRECTIONS.SERVER_TO_SERVER })
public onSayHello(): void {
  console.log('Hello!');
}
```

### [](#client-to-client)Event Communication: Client to Client
When establishing event communication between a client script and another client script, the `EventListener()` **needs** to specify an event direction and you **need** to trigger the event accordingly:

```ts
// client_1.controller.ts
emit('say-hello');
```

```ts
// client_2.controller.ts
@EventListener({ eventName: 'say-hello', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
public onSayHello(): void {
  console.log('Hello!');
}
```
