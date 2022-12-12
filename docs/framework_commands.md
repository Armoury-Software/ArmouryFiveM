---
layout: default
title: Commands
parent: Framework
nav_order: 4
---

## Commands
Commands are used in order to run some specific functionality whenever the player runs a command either in the console or in the chat.
For example, you might want to salute the player whenever they type /hello.
<br>The Armoury Framework recognizes functions annotated with the `@Command()` decorator and automatically marks them as commands.
The name of the command is the name of the function itself!

### [](#creating-a-command)Creating a command: Basic example
```ts
// server.controller.ts
@Command() // Command becomes usable in game by typing '/hello'
public hello(playerId: number): void {
  console.log(`${GetPlayerName()} has just said Hello!`); // Prints 'Playername has just said Hello!' inside the server console
}
```

### [](#creating-a-command-with-parameters)Creating a command: Adding parameters
Sometimes you might need to also make use of a parameter: for example, use something like `/greet <playerId>` in order to say hello to another player.
```ts
// server.controller.ts
@Command() // Command becomes usable in game by typing '/greet <playerId>' - Example: '/greet 1'
public greet(playerId: number, [otherPlayerId: number]): void {
  console.log(`${GetPlayerName(playerId)} has just said hello to ${GetPlayerName(otherPlayerId)}!`);
}
```
*Notice the brackets between the 'otherPlayerId' parameter above? It is required to place the parameters of your command inside brackets!*
