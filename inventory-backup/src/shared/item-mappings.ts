import {
  Weapon,
  Weapons,
} from '../../../weapons/src/shared/models/weapon.model';
import {
  WEAPON_NAMES,
  WEAPON_NAMES_FOR_TESTS,
} from '../../../weapons/src/shared/weapon';
import {
  numberWithCommas,
  phoneFormatted,
  toThousandsString,
} from '../../../[utils]/utils';
import {
  Clothings,
  Items,
} from '../../../authentication/src/shared/models/player.model';
import { WeaponHash } from 'fivem-js';
import { Clothing } from './models/clothing.model';

// Each key in this object is the exact match of one of the keys in the player interface in authentication resource
export const ITEM_MAPPINGS = {
  // TODO: Add bruteAmount property for EACH item / item collection !!!
  // TODO: bruteAmount NEEDS to have following parameters: (value (this would be image), piKey)
  housekeys: {
    bruteAmount: (piKey: number, piKeyParentValue?: number[]) => piKey,
    description: (value: number) => [
      'item_housekey_description',
      { id: value },
    ],
    value: (value: number) => '#' + value,
    insertionCondition: (value: number) => value >= 0,
    isTransferrable: () => false,
  },
  businesskeys: {
    bruteAmount: (piKey: number, piKeyParentValue?: number[]) => piKey,
    description: (value: number) => [
      'item_businesskey_description',
      { id: value },
    ],
    value: (value: number) => '#' + value,
    insertionCondition: (value: number) => value >= 0,
    isTransferrable: () => false,
  },
  vehiclekeys: {
    bruteAmount: (piKey: number, piKeyParentValue?: number[]) => piKey,
    description: (value: number) => [
      'item_vehiclekey_description',
      { id: value },
    ],
    value: (value: number) => '#' + value,
    insertionCondition: (value: number[]) => !!value.length,
    isTransferrable: () => false,
    image: (value: number) =>
      global.exports['vehicles'].getVehicleHashKeyFromVehicleDbId(value),
  },
  factionvehiclekeys: {
    bruteAmount: (piKey: number, piKeyParentValue?: number[]) => piKey,
    description: (value: number) => [
      'item_factionvehiclekey_description',
      { id: value },
    ],
    value: (value: number) => '#' + value,
    insertionCondition: (value: number[]) => !!value.length,
    isTransferrable: () => false,
    image: () => 'key',
  },
  weapons: {
    type: 'Weapon',
    description: (value: [number, Weapon]) => [
      WEAPON_MAPPINGS[Number(value[0])]?.description || '',
    ],
    bruteAmount: (
      piKey: number | string,
      piKeyParentValue: Weapons | number | string,
      secondaryPiKeyParentValue?: Weapons
    ) => {
      if (typeof piKey === 'string') {
        return (
          secondaryPiKeyParentValue &&
          typeof secondaryPiKeyParentValue === 'object'
            ? secondaryPiKeyParentValue
            : piKeyParentValue
        )[WeaponHash[piKey]]?.ammo;
      }

      return (
        secondaryPiKeyParentValue &&
        typeof secondaryPiKeyParentValue === 'object'
          ? secondaryPiKeyParentValue
          : piKeyParentValue
      )[Number(piKey)]?.ammo;
    },
    value: (value: [number | string, Weapon]) => {
      if (!value[1] || typeof value[1] !== 'object') {
        return value[1].toString();
      }

      return value[1].ammo.toString();
    },
    topLeft: (value: [number, Weapon]) => WEAPON_NAMES[value[0]],
    image: (value: [number, Weapon]) => WEAPON_NAMES_FOR_TESTS[value[0]],
    incrementor: (
      currentValue: Weapons,
      incrementWhich: number,
      incrementBy: number,
      otherValue?: Weapons // When amount is < 0, this is the destinationValue. When it is >= 0, it is the sourceValue
    ) => {
      if (currentValue[WeaponHash[incrementWhich]]) {
        if (
          incrementBy < 0 &&
          otherValue &&
          !otherValue[WeaponHash[incrementWhich]]
        ) {
          delete currentValue[WeaponHash[incrementWhich]];
          return currentValue;
        }

        currentValue[WeaponHash[incrementWhich]].ammo += incrementBy;

        if (currentValue[WeaponHash[incrementWhich]].ammo < 0) {
          currentValue[WeaponHash[incrementWhich]].ammo = 0;
        }
      } else {
        if (
          incrementBy >= 0 &&
          otherValue &&
          otherValue[WeaponHash[incrementWhich]]
        ) {
          currentValue[WeaponHash[incrementWhich]] = {
            ammo: otherValue[WeaponHash[incrementWhich]]?.ammo,
          };
          return currentValue;
        }
        currentValue[WeaponHash[incrementWhich]] = { ammo: incrementBy };
      }

      return currentValue;
    },
    shouldSkipAmountConfirmation: (
      giver: Weapons,
      receiver: Weapons,
      type: number | string
    ) => {
      if (giver && receiver) {
        const computedHash: number =
          typeof type === 'string' ? WeaponHash[type] : type;

        if (!receiver[computedHash] || !giver[computedHash]?.ammo) {
          return true;
        }
      }

      return false;
    },
  },
  phone: {
    type: 'Electronics',
    bruteAmount: (piKey: number | string, piKeyParentValue: number) =>
      piKeyParentValue,
    description: (value: number) => [
      'item_electronics_phone_description',
      { phone: phoneFormatted(value) },
    ],
    value: (value: number) => phoneFormatted(value),
    insertionCondition: (value: number) => Number(value) > 0,
    isTransferrable: () => false,
  },
  cash: {
    type: 'Currency',
    bruteAmount: (piKey: number | string, piKeyParentValue: number) =>
      piKeyParentValue,
    description: (value: number) => [
      'item_currency_cash_description',
      { cash: numberWithCommas(value) },
    ],
    value: (value: number) => toThousandsString(value),
    insertionCondition: (value: number) => Number(value) > 0,
  },
  items: {
    type: 'Miscellaneous',
    bruteAmount: (
      piKey: number | string,
      piKeyParentValue: object,
      piSecondaryKey?: string
    ) => {
      return piKeyParentValue[piSecondaryKey || piKey];
    },
    description: (value: [string, number]) => [
      `item_Miscellaneous_${value[0]}_description`,
    ],
    value: (value: [string, number]) => value[1].toString(),
    image: (value: [string, number]) => value[0],
    incrementor: (
      currentValue: Items,
      incrementWhich: string,
      incrementBy: number
    ) => {
      if (currentValue[incrementWhich]) {
        currentValue[incrementWhich] += incrementBy;

        if (currentValue[incrementWhich] <= 0) {
          delete currentValue[incrementWhich];
        }
      } else {
        currentValue[incrementWhich] = incrementBy;
      }

      return currentValue;
    },
    isTransferrable: (value: string) =>
      MISC_ITEM_MAPPINGS[value].transferrable ?? true,
    isRefridgeratable: (value: string) =>
      MISC_ITEM_MAPPINGS[value].refridgeratable ?? false,
  },
  clothings: {
    type: 'Clothing',
    bruteAmount: (
      piKey: number | string,
      piKeyParentValue: object,
      _piSecondaryKey?: string
    ) => {
      return !!piKeyParentValue[piKey];
    },
    description: (value: [string, number]) => [
      `item_Clothing_${value[0].split('_')[0]}_description`,
    ],
    value: (value: [string, Clothing]) => '1',
    image: (value: [string, number]) => value[0].split('_')[0],
    incrementor: (
      currentValue: number | Clothings,
      incrementWhich: string,
      incrementBy: number | Clothing,
      otherValue?: Clothing
    ) => {
      console.log('currentValue:', currentValue);
      console.log('incrementWhich:', incrementWhich);
      console.log('incrementBy:', incrementBy);
      console.log('otherValue:', otherValue);
      if (incrementBy < 0 && currentValue[incrementWhich]) {
        delete currentValue[incrementWhich];
      } else if (typeof incrementBy === 'object') {
        currentValue[incrementWhich] =
          incrementBy[incrementWhich] || incrementBy || {};
      }

      return currentValue;
    },
    metadata: ([clothingId, value]: [string, Clothing]) => {
      return {
        type: clothingId,
      };
    },
    isTransferrable: (_value: string) => true,
    isRefridgeratable: (_value: string) => false,
  },
};

export const MISC_ITEM_MAPPINGS = {
  apple: {
    refridgeratable: true,
  },
  chocolate: {
    refridgeratable: true,
  },
  donut: {
    refridgeratable: true,
  },
  sandwich: {
    refridgeratable: true,
  },
  water: {
    refridgeratable: true,
  },
  coke: {
    refridgeratable: true,
  },
  red_bull: {
    refridgeratable: true,
  },
  cold_coffee: {
    refridgeratable: true,
  },
  beer_can: {
    refridgeratable: true,
  },
  rum: {
    refridgeratable: true,
  },
  whiskey: {
    refridgeratable: true,
  },
  champagne: {
    refridgeratable: true,
  },
  bandages: {},
  medkit: {},
  fuel_cannister: {},
  toolbox: {},
  vehicle_documents: {
    transferrable: false,
  },
  fridge_documents: {
    transferrable: false,
  },
};

export const WEAPON_MAPPINGS = {
  /* Knife */ 2578778090: {},
  /* Nightstick */ 1737195953: {},
  /* Hammer */ 1317494643: {},
  /* Bat */ 2508868239: {},
  /* GolfClub */ 1141786504: {},
  /* Crowbar */ 2227010557: {},
  /* Bottle */ 4192643659: {},
  /* SwitchBlade */ 3756226112: {},
  /* Pistol */ 453432689: {},
  /* CombatPistol */ 1593441988: {},
  /* APPistol */ 584646201: {},
  /* Pistol50 */ 2578377531: {},
  /* FlareGun */ 1198879012: {},
  /* MarksmanPistol */ 3696079510: {},
  /* Revolver */ 3249783761: {},
  /* MicroSMG */ 324215364: {},
  /* SMG */ 736523883: {},
  /* AssaultSMG */ 4024951519: {},
  /* CombatPDW */ 171789620: {},
  /* AssaultRifle */ 3220176749: {},
  /* CarbineRifle */ 2210333304: {},
  /* AdvancedRifle */ 2937143193: {},
  /* CompactRifle */ 1649403952: {},
  /* MG  */ 2634544996: {
    description:
      'An auto-firing, rifled long-barrel autoloading firearm designed for sustained direct fire.',
    maximumAmmoInClip: 54,
    type: 'Machine Gun',
  },
  /* CombatMG */ 2144741730: {},
  /* PumpShotgun */ 487013001: {},
  /* SawnOffShotgun */ 2017895192: {},
  /* AssaultShotgun */ 3800352039: {},
  /* BullpupShotgun */ 2640438543: {},
  /* DoubleBarrelShotgun */ 4019527611: {},
  /* StunGun */ 911657153: {},
  /* SniperRifle */ 100416529: {},
  /* HeavySniper */ 205991906: {},
  /* GrenadeLauncher */ 2726580491: {},
  /* GrenadeLauncherSmoke */ 1305664598: {},
  /* RPG */ 2982836145: {},
  /* Minigun */ 1119849093: {},
  /* Grenade */ 2481070269: {},
  /* StickyBomb */ 741814745: {},
  /* SmokeGrenade */ 4256991824: {},
  /* BZGas */ 2694266206: {},
  /* Molotov */ 615608432: {},
  /* FireExtinguisher */ 101631238: {},
  /* PetrolCan */ 883325847: {},
  /* SNSPistol */ 3218215474: {},
  /* SpecialCarbine */ 3231910285: {},
  /* HeavyPistol */ 3523564046: {},
  /* BullpupRifle */ 2132975508: {},
  /* HomingLauncher */ 1672152130: {},
  /* ProximityMine */ 2874559379: {},
  /* Snowball */ 126349499: {},
  /* VintagePistol */ 137902532: {},
  /* Dagger */ 2460120199: {},
  /* Firework */ 2138347493: {},
  /* Musket */ 2828843422: {},
  /* MarksmanRifle */ 3342088282: {},
  /* HeavyShotgun */ 984333226: {},
  /* Gusenberg */ 1627465347: {},
  /* Hatchet */ 4191993645: {},
  /* Railgun */ 1834241177: {},
  /* Unarmed */ 2725352035: {},
  /* KnuckleDuster */ 3638508604: {},
  /* Machete */ 3713923289: {},
  /* MachinePistol */ 3675956304: {},
  /* Flashlight */ 2343591895: {},
  /* Ball */ 600439132: {},
  /* Flare */ 1233104067: {},
  /* NightVision */ 2803906140: {},
  /* Parachute */ 4222310262: {},
  /* SweeperShotgun */ 317205821: {},
  /* BattleAxe */ 3441901897: {},
  /* CompactGrenadeLauncher */ 125959754: {},
  /* MiniSMG */ 3173288789: {},
  /* PipeBomb */ 3125143736: {},
  /* PoolCue */ 2484171525: {},
  /* Wrench */ 419712736: {},
  /* PistolMk2 */ 3219281620: {},
  /* AssaultRifleMk2 */ 961495388: {},
  /* CarbineRifleMk2 */ 4208062921: {},
  /* CombatMGMk2 */ 3686625920: {},
  /* HeavySniperMk2 */ 177293209: {},
  /* SMGMk2 */ 2024373456: {},
};
