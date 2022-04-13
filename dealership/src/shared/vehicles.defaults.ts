export const VEHICLES_DEFAULTS: {
  [modelHashKey: string]: CustomVehicleConfiguration;
} = {
  landstalker: {
    brand: 'Toyota',
    description: 'LandCruiser Prado, 2009',
    price: 1250000,
  },
  '17r35': {
    brand: 'Nissan',
    description: 'GTR R35, 2017',
    price: 2500000,
  },
  '18camaro': {
    brand: 'Chevrolet',
    description: 'Camaro ZL1, 2018',
    price: 2500000,
  },
  '68firebird': {
    brand: 'Pontiac',
    description: 'Firebird, 1968',
    price: 2500000,
  },
  '69nova': {
    brand: 'Chevrolet',
    description: 'Nova, 1969',
    price: 2500000,
  },
  bmw507: {
    brand: 'BMW',
    description: '507 2.0, 1959',
    price: 2500000,
  },
  bmwm5e60: {
    brand: 'BMW',
    description: 'M5 E60, 2008',
    price: 2500000,
  },
  brz13: {
    brand: 'Subaru',
    description: 'BRZ, 2013',
    price: 2500000,
  },
  camarozl1: {
    brand: 'Chevrolet',
    description: 'Camaro ZL1, 2017',
    price: 2500000,
  },
  celisupra: {
    brand: 'Toyota',
    description: 'Celica Supra MKII, 1984',
    price: 2500000,
  },
  chrxfire: {
    brand: 'Chrysler',
    description: 'Crossfire, 2004',
    price: 2500000,
  },
  cobaltss: {
    brand: 'Chevrolet',
    description: 'Cobalt SS, 2006',
    price: 2500000,
  },
  dubsta2: {
    brand: 'Mercedes',
    description: 'G AMG 2015',
    price: 2500000,
  },
  fer612sc: {
    brand: 'Ferrari',
    description: '612 Scaglietti, 2004',
    price: 2500000,
  },
  forgt50020: {
    brand: 'Ford',
    description: 'Mustang Shelby GT500, 2020',
    price: 2500000,
  },
  fto: {
    brand: 'Mitsubishi',
    description: 'FTO GP Version-R, 1997',
    price: 2500000,
  },
  hondelsol: {
    brand: 'Honda',
    description: 'CR-X Del Sol, 1997',
    price: 2500000,
  },
  lexlfa10: {
    brand: 'Lexus',
    description: 'LFA, 2010',
    price: 2500000,
  },
  lexsc430: {
    brand: 'Lexus',
    description: 'SC 430 ZC40, 2001',
    price: 2500000,
  },
  m686eu: {
    brand: 'BMW',
    description: 'M635 CSi, 1986',
    price: 2500000,
  },
  mercw126: {
    brand: 'Mercedes',
    description: '560SEL w126, 1990',
    price: 2500000,
  },
  mr2sw20: {
    brand: 'Toyota',
    description: 'MR-2 GT SW-20, 1991',
    price: 2500000,
  },
  ninef: {
    brand: 'Audi',
    description: 'R8, 2018',
    price: 2500000,
  },
  nisgtsrr31: {
    brand: 'Nissan',
    description: 'Skyline GTS-R R31, 1989',
    price: 2500000,
  },
  por911: {
    brand: 'Porsche',
    description: '911 Carrera S, 2018',
    price: 2500000,
  },
  porcgt03: {
    brand: 'Porsche',
    description: 'Carrera GT 980, 2003',
    price: 2500000,
  },
  silvias15: {
    brand: 'Nissan',
    description: 'Silvia S15 Spec-R, 1999',
    price: 2500000,
  },
  slsamg: {
    brand: 'Mercedes',
    description: 'SLS AMG, 2011',
    price: 2500000,
  },
  sublegab4: {
    brand: 'Subaru',
    description: 'Legacy 2.0 GT B4, 2005',
    price: 2500000,
  },
  zentorno: {
    brand: 'Lamborghini',
    description: 'Aventador LP700-4, 2013',
    price: 2500000,
  },
};

export interface CustomVehicleConfiguration {
  brand: string;
  description: string;
  price: number;
}
