import { WEAPON_NAMES } from '../../../weapons/src/shared/weapon';
import { ContextMenu } from '../../../armoury-overlay/src/shared/context-menu.model';
import { Context } from 'vm';

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
      adminLevel: 3
    },
    {
      label: 'Give Drugs',
      adminLevel:
    },
    {
      label: 'Give Money',
      adminLevel: 5
    },
    {
      label: 'Give Vehicle',
      adminLevel: 3
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
      adminLevel:
    },
    {
      label: 'Cocaine',
      adminLevel:
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
      adminLevel:
    },
    {
      label: '50000$',
      adminLevel:
    },
    {
      label: '100000$',
      adminLevel:
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
      adminLevel:
    },
    {
      label: 'Hakuchou',
      adminLevel:
    },
    {
      label: 'Sadler',
      adminLevel:
    },
    {
      label: 'Rumpo',
      adminLevel:
    },
    {
      label: 'Sandking',
      adminLevel:
    },
    {
      label: 'Zentorno',
      adminLevel:
    },
    {
      label: 'Akula',
      adminLevel:
    },
    {
      label: 'Lazer',
      adminLevel:
    },
    {
      label: 'Longfin',
      adminLevel:
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
      label: 'House',
      active: true,
      adminLevel:
    },
    {
      label: 'Business',
      adminLevel:
    },
    {
      label: 'Faction',
      adminLevel:
    },
    {
      label: 'Vehicles',
      adminLevel: 3
    },
  ],
  title: 'Admin Menu: Remove Entities',
  id: 'remove-entities',
};
