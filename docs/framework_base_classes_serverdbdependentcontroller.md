---
layout: default
title: ServerDBDependentController
parent: Base Classes
grand_parent: Framework
---

## ServerDBDependentController
The ServerDBDependentController can be used when writing a resource which relies on information which is stored into a MySQL database. It handles all the CRUD operations and makes work much easier.
<br>In order to correctly make use of this class, you **need** to define an interface, and focus your resource development on working on top of a single, independent entity.<br><br>
*\*The ServerDBDependentController base class directly extends ServerController, so you can make use of all the functionality present in both ServerController and ServerDBDependentController*


### [](#extending)Extending the ServerDBDependentController
In order to make use of the ServerDBDependentController, you first need to modify the default extended class (ServerController) to **ServerDBDependentController**, as follows:
```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<MyInterface>
```

**REQUIRED:** When working with this base class, you need to define an interface for the entity. You can find an example below:

```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
}

export interface Vehicle {
  id: number;
  owner: string;
  health: number;
}
```

**REQUIRED:** When working with this base class, you also need to provide parameters into the class constructor when it is created, by modifying the `server.ts` file:

```ts
// server.ts
const server = new Server('vehicles', false);
```

### [](#constructor)The ServerDBDependentController constructor
The ServerDBDependentController class requires specifying minimum one parameter (the 'dbTableName', which in the example above is 'vehicles' - this means that our resource will
work with the 'vehicles' table inside our MySQL database.
<br>Below you can find all the parameters inside its constructor:

<table>
  <tr>
    <th>Property</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>dbTableName</td>
    <td>Specifies the table which our resource will use for creating, updating and deleting data in/from our MySQL Database</td>
  </tr>
  <tr>
    <td>loadAllAtStart</td>
    <td>Specifies whether our resource will load all the data and store it into memory when the resource is loaded</td>
  </tr>
</table>

### [](#creating)Creating entities
The steps above are the initial setup for extending the ServerDBDependentController class. At this point, you can easily create an entity with just a few lines of code:

```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  @Command()
  public async createVehicle(playerId: number, [ownerName: string]): void {
    const vehicle = await this.createEntity({ owner: ownerName, health: 100.0 });
    
    console.log(`Vehicle with ID ${vehicle.id} has been created!`);
  }
}
```
The code above automatically creates a row inside the MySQL table, assigns an id to it, and returns the entity back.

### [](#updating)Updating entities
Just like creating entities, updating becomes as easy as possible:

```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  @Command() // Command becomes usable as /updatevehicleowner <vehicleId> <ownerName>
  public async updateVehicleOwner(playerId: number, [vehicleId: number, ownerName: string]): void {
    const vehicle = this.getEntityByDBId(vehicleId); // Gets the entity with the specified ID (vehicleID) inside the MySQL database
    
    vehicle.owner = ownerName;
    
    this.saveDBEntityAsync(playerId);
  }
}
```

### [](#updating)Deleting entities
Just like creating entities and updating entities, deleting becomes as easy as possible:

```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerDBDependentController<Vehicle> {
  @Command() // Command becomes usable as /removevehicle <vehicleId>
  public async removeVehicle(playerId: number, [vehicleId: number]): void {
    const vehicle = this.getEntityByDBId(vehicleId); // Gets the entity with the specified ID (vehicleID) inside the MySQL database
   
    this.removeEntity(vehicle);
  }
}
```
