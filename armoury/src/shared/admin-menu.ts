import { WEAPON_NAMES } from '../../../weapons/src/shared/weapon';
import { ContextMenu } from '../../../armoury-overlay/src/shared/context-menu.model';

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
