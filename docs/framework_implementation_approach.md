---
layout: default
title: Implementation Approach
parent: Framework
nav_order: 1
---

## Implementation Approach
It is highly recommended that you modularize your resources so that every resource has its own responsibility, with **zero** dependency on any other resource.
The **Armoury Gamemode** serves as a learning playground - each resource is independent with its own responsibility.

Let's take the 'Factions' concept from the **Armoury Gamemode** as an example. Even though it's basically one big topic, the 'Factions' concept is actually divided
into several resources:

```
(Factions)
    └ 'factions' resource
    └ 'factions-police' resource
    └ 'factions-tcc' resource
    └ 'factions-taxi' resource
    ...
    └ 'factions-logs' resource
    └ 'factions-activity' resource
```

It is much easier to keep your code readable and maintainable when your whole codebase is structured logically. Also, there are several classes built into the Armoury
Framework which you can extend in order to avoid code duplication.
