export type BrandItem = {
  name: string;
  logo?: string;
  wordmark?: 'aldo' | 'uspolo';
};

export const brandItems: BrandItem[] = [
  { name: 'Allen Solly' },
  { name: 'Adidas', logo: '/brands/adidas.svg' },
  { name: 'Under Armour', logo: '/brands/under-armour.svg' },
  { name: 'Puma', logo: '/brands/puma.svg' },
  { name: 'ALDO', wordmark: 'aldo' },
  { name: 'U.S. POLO ASSN.', wordmark: 'uspolo' },
  { name: 'Amanthe' },
  { name: 'Crocodile' },
  { name: 'Skechers' },
  { name: 'Titan' },
  { name: 'Miniso' },
  { name: 'Waves' },
];
