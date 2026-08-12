import SweatshirtImg from '../assets/images/sweatshirt-banner.png';
import PoloImg from '../assets/images/polo-t-shirt-banner.png';
import HoodiesImg from '../assets/images/hoodies-banner.png';
import SweatshirtMobileImg from '../assets/images/sweatshirt-mobile-banner.png';
import PoloMobileImg from '../assets/images/polo-t-shirt-mobile-banner.png';
import HoodiesMobileImg from '../assets/images/hoodies-mobile-banner.png';

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
  Sweatshirts: {
    slug: 'sweatshirt',
    label: 'Sweatshirts',
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
  sweatshirt: 'Sweatshirts',
};

