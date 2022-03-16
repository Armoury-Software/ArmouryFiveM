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
  ],
  title: 'Admin Menu',
  id: 'admin-menu',
};

export const ADMIN_GIVE_SELF: ContextMenu = {
  items: [
    {
      label: 'Give Weapon',
      active: true,
    },
    {
      label: 'Give Drugs',
    },
    {
      label: 'Give Money',
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
