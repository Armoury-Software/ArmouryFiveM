---
layout: default
title: Events
nav_order: 3
---

## Events
Events are used in order to establish communication between resources or scripts - for example, one resource communicating with another resource, or one server script file communicating with a client script file from the same resource.
<br>The Armoury Framework recognizes functions annotated with the `@EventListener()` decorator and automatically marks them as event listeners.

The `@EventListener()` decorator accepts a configuration object with a few properties which define the functionality of our EventListener:
| Property   | Description | Default value     |
| :---       |    :---   |          :---     |
| eventName  | Name of the event to listen to  | Name of the function which the decorator has been added to |
| direction  | Decides whether the EventListener listens to triggers from another script type (client/server) or not<br><br><strong>Values:</strong><br>SERVER_TO_SERVER - Only listens when defined inside a server script, and triggered from a server script<br>SERVER_TO_CLIENT - Only listens when defined inside a server script, and triggered from a client script<br>CLIENT_TO_SERVER - Only listens when defined inside a client script, and triggered from a server script<br>CLIENT_TO_CLIENT - Only listens when defined inside a client script, and client from a server script | By default: listens for cross-script communication (server-to-client or client-to-server)<br>\* *Can be omitted* |

### [](#listening-for-events)Listening for events: Basic example
<table>
  <tr>
    <td>server.controller.ts (Typescript/Armoury)</td>
    <td>server.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  @EventListener({ eventName: 'say-hello' })
  public onSayHello(): void {
    console.log('Hello!');
  }
  ```

  </td>
  <td>

  ```lua
  RegisterNetEvent("say-hello")

  AddEventHandler("say-hello", function()
      print("Hello!")
  end)
  ```

  </td>
  </tr>
</table>

### [](#triggering-events)Triggering events: Basic example

<table>
  <tr>
    <td>client.controller.ts (Typescript/Armoury)</td>
    <td>client.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  TriggerServerEvent('say-hello');
  ```

  </td>
  <td>

  ```lua
  TriggerServerEvent("say-hello")
  ```

  </td>
  </tr>
</table>

---

## [](#special-cases)Special cases
Sometimes you need to trigger an event from a client script and listen for it in another client script, or sometimes you might need to trigger an event from a server script and listen for it in another server script. In order to do this, you might need to specify the event direction and trigger the event accordingly.

### [](#server-to-client)Event Communication: Server to Client
When establishing event communication between a server script and a client script, the `EventListener()` does not necessarily need to specify an event direction - but you **need** to trigger the event accordingly:

<table>
  <tr>
    <td>server.controller.ts (Typescript/Armoury)</td>
    <td>server.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  TriggerClientEvent('say-hello');
  ```

  </td>
  <td>

  ```lua
  TriggerClientEvent("say-hello")
  ```

  </td>
  </tr>
</table>

<table>
  <tr>
    <td>client.controller.ts (Typescript/Armoury)</td>
    <td>client.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  @EventListener({ eventName: 'say-hello' })
  public onSayHello(): void {
    console.log('Hello!');
  }
  ```

  </td>
  <td>

  ```lua
  RegisterNetEvent("say-hello")

  AddEventHandler("say-hello", function()
      print("Hello!")
  end)
  ```

  </td>
  </tr>
</table>

### [](#client-to-server)Event Communication: Client to Server
When establishing event communication between a client script and a server script, the `EventListener()` does not necessarily need to specify an event direction - but you **need** to trigger the event accordingly:

<table>
  <tr>
    <td>client.controller.ts (Typescript/Armoury)</td>
    <td>client.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  TriggerServerEvent('say-hello');
  ```

  </td>
  <td>

  ```lua
  TriggerServerEvent("say-hello")
  ```

  </td>
  </tr>
</table>

<table>
  <tr>
    <td>server.controller.ts (Typescript/Armoury)</td>
    <td>server.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  @EventListener({ eventName: 'say-hello' })
  public onSayHello(): void {
    console.log('Hello!');
  }
  ```

  </td>
  <td>

  ```lua
  RegisterNetEvent("say-hello")

  AddEventHandler("say-hello", function()
      print("Hello!")
  end)
  ```

  </td>
  </tr>
</table>

### [](#server-to-server)Event Communication: Server to Server
When establishing event communication between a server script and another server script, the `EventListener()` **needs** to specify an event direction and you **need** to trigger the event accordingly:

<table>
  <tr>
    <td>server_1.controller.ts (Typescript/Armoury)</td>
    <td>server_1.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  emit('say-hello');
  ```

  </td>
  <td>

  ```lua
  emit("say-hello")
  ```

  </td>
  </tr>
</table>

<table>
  <tr>
    <td>server_2.controller.ts (Typescript/Armoury)</td>
    <td>server_2.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  @EventListener({ eventName: 'say-hello', direction: EVENT_DIRECTIONS.SERVER_TO_SERVER })
  public onSayHello(): void {
    console.log('Hello!');
  }
  ```

  </td>
  <td>

  ```lua
  RegisterNetEvent("say-hello")

  AddEventHandler("say-hello", function()
      print("Hello!")
  end)
  ```

  </td>
  </tr>
</table>

### [](#client-to-client)Event Communication: Client to Client
When establishing event communication between a client script and another client script, the `EventListener()` **needs** to specify an event direction and you **need** to trigger the event accordingly:

<table>
  <tr>
    <td>client_1.controller.ts (Typescript/Armoury)</td>
    <td>client_1.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  emit('say-hello');
  ```

  </td>
  <td>

  ```lua
  emit("say-hello")
  ```

  </td>
  </tr>
</table>

<table>
  <tr>
    <td>client_2.controller.ts (Typescript/Armoury)</td>
    <td>client_2.lua (Lua/Default)</td>
  </tr>
  <tr>
  <td>
    
  ```ts
  @EventListener({ eventName: 'say-hello', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  public onSayHello(): void {
    console.log('Hello!');
  }
  ```

  </td>
  <td>

  ```lua
  RegisterNetEvent("say-hello")

  AddEventHandler("say-hello", function()
      print("Hello!")
  end)
  ```

  </td>
  </tr>
</table>
