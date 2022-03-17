export const CATEGORY_MAPPINGS = {
  house: {
    outline: '#293577',
    width: 65,
    image: 'key',
    useCategoryNameAsType: true,
    value: (value) => '#' + value.toString(),
  },
  business: {
    outline: '#31644f',
    width: 65,
    image: 'key',
    useCategoryNameAsType: true,
    value: (value) => '#' + value.toString(),
  },
  vehicle: {
    outline: '#a358b8',
    width: 100,
    value: (value) => '#' + value.toString(),
    topLeft: ' ',
  },
  weapon: {
    outline: '#6e2937',
    width: 100,
    value: (value) => value.ammo.toString(),
  },
  misc: {
    outline: '#878b9f',
    width: 65,
  },
};
