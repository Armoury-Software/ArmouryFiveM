import { ContextMenu } from '../../../../armoury-overlay/src/shared/context-menu.model';

export const ADMIN_MENU_MAIN: ContextMenu = {
  items: [
    {
      label: 'Give Self',
      active: true,
    },
    {
      label: 'Teleports',
    },
    {
      label: 'Player Administration',
    },
    {
      label: 'Remove Entities',
    },
  ],
  title: 'Admin Menu',
  id: 'admin-menu',
};

export const ADMIN_GIVE_SELF: ContextMenu = {
  items: [
    {
      label: 'Give Weapon',
      active: true,
      adminLevel: 3,
    },
    {
      label: 'Give Drugs',
      adminLevel: 5,
    },
    {
      label: 'Give Money',
      adminLevel: 5,
    },
    {
      label: 'Give Vehicle',
      adminLevel: 3,
    },
  ],
  title: 'Admin Menu: Give Self',
  id: 'give-self-menu',
};

export const ADMIN_GIVE_WEAPON: ContextMenu = {
  items: [],
  title: 'Admin Menu: Give Weapon',
  id: 'give-weapon',
};

export const ADMIN_GIVE_DRUGS: ContextMenu = {
  items: [
    {
      label: 'Marijuana',
      active: true,
    },
    {
      label: 'Cocaine',
    },
  ],
  title: 'Admin Menu: Give Drugs',
  id: 'give-drugs',
};

export const ADMIN_GIVE_MONEY: ContextMenu = {
  items: [
    {
      label: '10000$',
      active: true,
    },
    {
      label: '50000$',
    },
    {
      label: '100000$',
    },
  ],
  title: 'Admin Menu: Give Money',
  id: 'give-money',
};

export const ADMIN_VEHICLES: ContextMenu = {
  items: [
    {
      label: 'Akuma',
      active: true,
    },
    {
      label: 'Hakuchou',
    },
    {
      label: 'Sadler',
    },
    {
      label: 'Rumpo',
    },
    {
      label: 'Sandking',
    },
    {
      label: 'Zentorno',
    },
    {
      label: 'Akula',
    },
    {
      label: 'Lazer',
    },
    {
      label: 'Longfin',
    },
  ],
  title: 'Admin Menu: Spawn Vehicle',
  id: 'veh-spawn',
};

export const ADMIN_TELEPORT: ContextMenu = {
  items: [],
  title: 'Admin Menu: Teleportation',
  id: 'teleportation',
};

export const ADMIN_PLAYER_ADMINISTRATION: ContextMenu = {
  items: [],
  title: 'Admin Menu: Player Administration',
  id: 'player-admin',
};

export const ADMIN_ENTITIES: ContextMenu = {
  items: [
    {
      label: 'Vehicles',
      adminLevel: 3,
      active: true,
    },
    {
      label: 'House',
      adminLevel: 6,
    },
    {
      label: 'Business',
      adminLevel: 6,
    },
    {
      label: 'Faction',
      adminLevel: 6,
    },
  ],
  title: 'Admin Menu: Remove Entities',
  id: 'remove-entities',
};
