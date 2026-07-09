import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProductDetailsPage.module.css';
import { categoryProducts, slugToCategory } from '../../data/productsData';
import Breadcrumb from '../../components/product/Breadcrumb/Breadcrumb';
import ImageGallery from '../../components/product/ImageGallery/ImageGallery';
import ColorSelector from '../../components/product/ColorSelector/ColorSelector';
import SizeSelector from '../../components/product/SizeSelector/SizeSelector';
import DeliveryCheck from '../../components/product/DeliveryCheck/DeliveryCheck';
import Accordion from '../../components/product/Accordion/Accordion';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import DummyImage from '../../assets/images/dummy-model.png';
import ShareIcon from '../../assets/icons/share-icon.svg?react';
import CartIcon from '../../assets/icons/cart-add.svg?react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Brown', image: DummyImage },
  { name: 'Navy', image: DummyImage },
  { name: 'Black', image: DummyImage },
  { name: 'White', image: DummyImage },
];

const GALLERY_IMAGES = [DummyImage, DummyImage, DummyImage];

const ProductDetailsPage = () => {
  const { category, productId } = useParams();
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('Black');

  const categoryKey = slugToCategory[category] || 'Polo T-Shirts';
  const products = categoryProducts[categoryKey] || [];
  const product = products.find((p) => p.id === Number(productId)) || products[0];

  if (!product) return null;

  const breadcrumbItems = [{ label: 'Home', to: '/' }, { label: categoryKey, to: `/shop/${category}` }, { label: 'Men' }];

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main>
      <div className='container'>
        <Breadcrumb items={breadcrumbItems} />

        <section className={styles.productSection}>
          <div className={styles.galleryCol}>
            <ImageGallery images={GALLERY_IMAGES} />
          </div>

          <div className={styles.infoCol}>
            <div className={styles.titleRow}>
              <h1 className={styles.productName}>{product.name}</h1>
              <button type='button' className={styles.shareBtn} aria-label='Share'>
                <ShareIcon width={32} height={32} />
              </button>
            </div>

            <p className={styles.subtitle}>Brown Geometric textured Knit Slim Fit Polo</p>

            <div className={styles.rating}>
              <svg width='16' height='16' fill='#FFA500' viewBox='0 0 24 24'>
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
              <span className={styles.ratingText}>4.5 Rating</span>
            </div>

            <p className={styles.price}>&#8377;899</p>
            <p className={styles.taxNote}>inclusive of all taxes</p>

            <ColorSelector colors={COLORS} activeColor={selectedColor} onSelect={setSelectedColor} />
            <SizeSelector sizes={SIZES} activeSize={selectedSize} onSelect={setSelectedSize} />

            <div className={styles.actions}>
              <Button variant='primary' size='md' className={styles.buyNowBtn}>
                Buy Now
              </Button>
              <button type='button' className={styles.addToBagBtn}>
                <CartIcon width={16} height={16} />
                Add To Bag
              </button>
            </div>

            <DeliveryCheck />

            <Accordion title='Description'>
              <p>
                A premium quality polo t-shirt with a geometric texture pattern. Made from breathable knit fabric for a comfortable slim
                fit. Perfect for casual and semi-formal occasions.
              </p>
            </Accordion>

            <Accordion title='Terms & Conditions'>
              <p>
                This product is eligible for return within 7 days of delivery. Please ensure the product is unused and in its original
                packaging. Refunds will be processed within 5-7 business days.
              </p>
            </Accordion>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>You may also like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailsPage;
