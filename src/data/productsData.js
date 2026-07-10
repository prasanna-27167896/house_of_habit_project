import bestSellerCard1 from '../assets/images/best-seller-card1.png';
import bestSellerCard2 from '../assets/images/best-seller-card2.png';
import bestSellerCard3 from '../assets/images/best-seller-card3.png';
import bestSellerCard4 from '../assets/images/best-seller-card4.png';

import SweatshirtImg from '../assets/images/Sweatshirt.png';
import PoloImg from '../assets/images/Polo.png';
import HoodiesImg from '../assets/images/Hoodies.png';
import SweatshirtMobileImg from '../assets/images/sweatshirt-mobile-banner.png';
import PoloMobileImg from '../assets/images/polo-t-shirt-mobile-banner.png';
import HoodiesMobileImg from '../assets/images/hoodies-mobile-banner.png';

import DummyImage from '../assets/images/dummy-model.png';

const createProducts = (type, count, basePrice, namePrefix = 'Solid Muscle Fit') =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${namePrefix} ${type}`,
    price: basePrice,
    image: DummyImage,
  }));

export const bestSellers = [
  {
    id: 1,
    name: 'Solid Muscle Fit Polo shirt',
    price: 899,
    image: DummyImage,
    backgroundImage: bestSellerCard1,
  },
  {
    id: 2,
    name: 'GARUD SF SPECIAL EDITION Hoodie',
    price: 1499,
    image: DummyImage,
    backgroundImage: bestSellerCard2,
  },
  {
    id: 3,
    name: 'Stepwise Polo',
    price: 1499,
    image: DummyImage,
    backgroundImage: bestSellerCard3,
  },
  {
    id: 4,
    name: 'Classic Comfort Hoodie',
    price: 1299,
    image: DummyImage,
    backgroundImage: bestSellerCard4,
  },
];

export const categoryTabs = ['Polo T-Shirts', 'Hoodies', 'Sweatshirt'];

export const categoryMeta = {
  'Polo T-Shirts': {
    slug: 'polo-t-shirts',
    label: 'Polo T-shirts',
    heroTitle: 'Polo T-shirts',
    heroSub: 'Contemporary clothing crafted for everyday confidence.',
    heroBg: `url(${PoloImg})`,
    heroBgMobile: `url(${PoloMobileImg})`,
    heroTextDark: false,
  },
  Hoodies: {
    slug: 'hoodies',
    label: 'Hoodies',
    heroTitle: 'Hoodies',
    heroSub: 'Contemporary clothing crafted for everyday confidence.',
    heroBg: `url(${HoodiesImg})`,
    heroBgMobile: `url(${HoodiesMobileImg})`,
    heroTextDark: true,
  },
  Sweatshirt: {
    slug: 'sweatshirt',
    label: 'Sweatshirt',
    heroTitle: 'Sweatshirt',
    heroSub: 'Contemporary clothing crafted for everyday confidence.',
    heroBg: `url(${SweatshirtImg})`,
    heroBgMobile: `url(${SweatshirtMobileImg})`,
    heroTextDark: false,
  },
};

export const slugToCategory = {
  'polo-t-shirts': 'Polo T-Shirts',
  hoodies: 'Hoodies',
  sweatshirt: 'Sweatshirt',
};

export const categoryProducts = {
  'Polo T-Shirts': createProducts('Polo shirt', 12, 666),
  Hoodies: createProducts('Hoodie', 12, 999),
  Sweatshirt: createProducts('Sweatshirt', 12, 899, 'Solid Regular Fit'),
};
