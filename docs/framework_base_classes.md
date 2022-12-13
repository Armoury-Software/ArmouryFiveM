---
layout: default
title: Base Classes
parent: Framework
has_children: true
---

## Base Classes
The **Armoury Framework** provides several Base Classes in order to avoid code duplication, and fasten your development time when creating resources.
<br>Base Classes provide basic functionality and also functions which work as scripting shortcuts, and are meant to be extended by child classes which further add functionality to them.

### [](#base-classes)The Base Classes of Armoury
The table below summarizes the role of each base class, and how you can make use of them:

<table>
  <tr>
    <th>Script Type (Server/Client)</th>
    <th>Class Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td align="center">Server</td>
    <td align="center">ServerController</td>
    <td>The ServerController is the bread and butter of <strong class="blue-000">server</strong> scripts in the Armoury Framework. It is the starting point controller type and it is the base class which is used when generating a new Armoury resource.</td>
  </tr>
  <tr>
    <td align="center">Server</td>
    <td align="center">ServerFactionController</td>
    <td>The ServerFactionController directly extends ServerController and contains functionality like Faction Vehicles, Faction Lockers, Faction Member Management and Faction HQs.</td>
  </tr>
  <tr>
    <td align="center">Server</td>
    <td align="center">ServerDBDependentController</td>
    <td>The ServerDBDependentController directly extends ServerController and contains functionality for CRUD operations on a MySQL database (this one depends on oxmysql!).</td>
  </tr>
  <tr>
    <td align="center">Server</td>
    <td align="center">ServerEntityWithEntranceController</td>
    <td>The ServerEntityWithEntranceController directly extends ServerDBDependentController and contains basic implementations for entrances and exits. An example resource extending this type of controller might be a 'houses' resource, or a 'businesses' one.</td>
  </tr>
</table>
  
<table>
  <tr>
    <th>Script Type (Server/Client)</th>
    <th>Class Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientController</td>
    <td>The ClientController is the bread and butter of <strong class="green-000">client</strong> scripts in the Armoury Framework. It is the starting point controller type and it is the base class which is used when generating a new Armoury resource.</td>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientWithUIController</td>
    <td>The ClientWithUIController directly extends ClientController and contains basic implementations for <strong>User Interfaces (UI)</strong>. Whenever you're creating a resource which would contain UI, make use of this class to speed up your development.</td>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientFactionController</td>
    <td>The ClientFactionController directly extends ClientWithUIController and contains the needed implementation in order to work with the ServerFactionController. When extending this class, you should also extend the ServerFactionController on the server script as well.</td>
  </tr>
</table>

### [](#internal-classes)Internal Classes (NOT meant to be extended!)
Even though they should not be directly extended, it would make sense to have a quick overview of the functionality behind the scenes of the **Armoury Framework**:

<table>
  <tr>
    <th>Script Type (Server/Client)</th>
    <th>Class Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td align="center">Server</td>
    <td align="center">ServerBase</td>
    <td>Contains shortcut functions for Routing Buckets</td>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientBase</td>
    <td>Contains functionality for Routing Buckets and "tick functions" management</td>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientEntities</td>
    <td>Contains functionality and code shortcuts for blips, markers, vehicles, peds, waypoints, and checkpoints</td>
  </tr>
  <tr>
    <td align="center">Client</td>
    <td align="center">ClientActionPoints</td>
    <td>Contains functionality related to "action points" - places where stuff should be executed.</td>
  </tr>
</table>

---

### [](#extending-classes)Extending Classes (or making use of the classes above)
When creating a new Armoury Resource using the automated scripts, a server controller usually looks like this:
```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerController {
}
```

As you might already know, whenever you're developing with the Armoury Framework, your implementation should go inside this class (either server.controller.ts/client.controller.ts/both).
<br>Pretty often, you might need to create a resource which stores and loads data into and out of the database. In this case, you would most probably benefit from the implementations provided in the ServerDBDependentController base class.
In order to make use of the base class, you can do the following:

```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<MyInterface> {
}

export interface MyInterface {
  id: number,
  owner: string,
}
```
*\* Notice how we are changing the extended class from "ServerController" to "ServerDBDependentController"*

Please visit the list above in order to find out other classes which might help you when developing.
