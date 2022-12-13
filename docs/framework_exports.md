---
layout: default
title: Exports
parent: Framework
nav_order: 3
---

## Exports
Exports are used in order to give another resource the opportunity to use functionality from your own resource by exposing functions.
For example, inside your `vehicles` resource, you might want to allow other resources to fetch all of a player's personal vehicles by exposing the `getPlayerVehicles()` function.
<br>The Armoury Framework recognizes functions annotated with the `@Export()` decorator and automatically marks them as exports.

### [](#creating-an-export)Creating an export: Basic example
```ts
// server.controller.ts inside 'vehicles' resource
@Export()
public getPlayerVehicles(playerId: number): void {
  return this.vehicles[playerId];
}
```

### [](#calling-exports)Calling exports: Basic example
```ts
// server.controller.ts inside 'foo' resource
console.log(
  global.exports['vehicles'].getPlayerVehicles(playerId)
);
```
