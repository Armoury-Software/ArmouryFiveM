import { Weapon } from '../../../weapons/src/shared/models/weapon.model';
import {
  WEAPON_NAMES,
  WEAPON_NAMES_FOR_TESTS,
} from '../../../weapons/src/shared/weapon';
import {
  numberWithCommas,
  phoneFormatted,
  toThousandsString,
} from '../../../[utils]/utils';

// Each key in this object is the exact match of one of the keys in the player interface in authentication resource
export const ITEM_MAPPINGS = {
  housekeys: {
    description: (value: number) =>
      `A clean key made of brass. Unlocks the door to House #${value}.`,
    value: (value: number) => '#' + value,
    insertionCondition: (value: number) => value >= 0,
  },
  businesskeys: {
    description: (value: number) =>
      `A clean key made of brass. Unlocks the door to Business #${value}.`,
    value: (value: number) => '#' + value,
    insertionCondition: (value: number) => value >= 0,
  },
  weapons: {
    type: 'Weapon',
    description: (value: [number, Weapon]) =>
      WEAPON_MAPPINGS[Number(value[0])].description ||
      'Description to be added',
    value: (value: [number, Weapon]) => value[1].ammo.toString(),
    topLeft: (value: [number, Weapon]) => WEAPON_NAMES[value[0]],
    image: (value: [number, Weapon]) => WEAPON_NAMES_FOR_TESTS[value[0]],
  },
  phone: {
    type: 'Electronics',
    description: (value: number) =>
      `A slick phone with numerous functionalities. SIM number: ${phoneFormatted(
        value
      )}.`,
    value: (value: number) => phoneFormatted(value),
    insertionCondition: (value: number) => Number(value) > 0,
  },
  cash: {
    type: 'Currency',
    description: (value: number) =>
      `Your hard-earned money. You have $${numberWithCommas(
        value
      )} in your pockets.`,
    value: (value: number) => toThousandsString(value),
    insertionCondition: (value: number) => Number(value) > 0,
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
