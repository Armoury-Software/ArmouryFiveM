---
layout: default
title: ServerController
parent: Base Classes
grand_parent: Framework
---

## ServerController
The ServerController is the main, most important base class for your server scripts inside your resources. Below you can find information and tips in order to make use of the Server Controller as much as possible:

### [](#extending)Extending the ServerController
Even though the automated scripts create classes which extend the ServerController by default, it might be helpful to know that a newly-generated resource looks exactly like this:
```ts
// server.controller.ts
@FiveMController()
export class Server extends ServerController {
}
```

The `FiveMController()` is an important decorator which also accepts an (optional) configuration object. At the moment, the configuration object provides the following properties:

<table>
  <tr>
    <th>Property</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>translationFile</td>
    <td>Specifies a translation file for your server controller. Please see the <a href="#">Localization Guide</a> for learning how you can easily add multiple languages to your scripts.</td>
  </tr>
</table>

An example of how you could make use of the configuration object can be seen below:
```ts
// server.controller.ts
@FiveMController({ translationFile: i18n })
export class Server extends ServerController {
  constructor() {
    super();
    
    console.log(this.translate('hello')); // Logs 'Hello!' or 'Hallo!' based on the player's language
  }
}

export const i18n = {
  en: {
    hello: 'Hello!',
  },
  ger: {
    hello: 'Hallo!',
  },
};
```
