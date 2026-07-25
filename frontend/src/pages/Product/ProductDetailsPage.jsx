import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProductDetailsPage.module.css';
import { slugToCategory } from '../../data/productsData';
import Breadcrumb from '../../components/product/Breadcrumb/Breadcrumb';
import ImageGallery from '../../components/product/ImageGallery/ImageGallery';
import ColorSelector from '../../components/product/ColorSelector/ColorSelector';
import SizeSelector from '../../components/product/SizeSelector/SizeSelector';
import DeliveryCheck from '../../components/product/DeliveryCheck/DeliveryCheck';
import Accordion from '../../components/product/Accordion/Accordion';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import DummyImage from '../../assets/images/dummy-model.png';
import ShareIcon from '../../assets/icons/share-icon.svg?react';
import CartIcon from '../../assets/icons/cart-add.svg?react';
import { fetchProductDetail, fetchHomeProducts, clearProductDetail } from '../../store/slices/productSlice';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const DEFAULT_COLORS = [
  { name: 'Brown', image: DummyImage },
  { name: 'Navy', image: DummyImage },
  { name: 'Black', image: DummyImage },
  { name: 'White', image: DummyImage },
];

const ProductDetailsPage = () => {
  const { category, productId } = useParams();
  const dispatch = useDispatch();

  const { productDetail, productDetailLoading, homeShuffledProducts } = useSelector((state) => state.product);

  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);

  const categoryKey = slugToCategory[category] || productDetail?.category?.categoryTitle || 'Polo T-Shirts';


  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetail(productId));
    }
    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (homeShuffledProducts.length === 0) {
      dispatch(fetchHomeProducts());
    }
  }, [dispatch, homeShuffledProducts.length]);

  // Extract gallery images
  const galleryImages = [
    productDetail?.imageUrl,
    productDetail?.imageUrl1,
    productDetail?.imageUrl2,
    productDetail?.imageUrl3,
  ].filter(Boolean);

  const imagesToDisplay = galleryImages.length > 0 ? galleryImages : [DummyImage, DummyImage, DummyImage];

  // Extract sizes and colors from variants
  const variants = productDetail?.variants || [];
  const variantSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const availableSizes = variantSizes.length > 0 ? variantSizes : DEFAULT_SIZES;

  const variantColorsMap = new Map();
  variants.forEach((v) => {
    if (v.color && !variantColorsMap.has(v.color)) {
      variantColorsMap.set(v.color, {
        name: v.color,
        image: productDetail?.imageUrl || DummyImage,
      });
    }
  });
  const availableColors = variantColorsMap.size > 0 ? Array.from(variantColorsMap.values()) : DEFAULT_COLORS;

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
    if (availableColors.length > 0 && !availableColors.some((c) => c.name === selectedColor)) {
      setSelectedColor(availableColors[0].name);
    }
  }, [availableSizes, availableColors]);

  if (productDetailLoading && !productDetail) {
    return (
      <main>
        <div className='container' style={{ padding: '6rem 0', minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader loadingText='Loading Product Details...' />
        </div>
      </main>

    );
  }

  if (!productDetail && !productDetailLoading) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: categoryKey, to: `/shop/${category}` },
    { label: productDetail?.gender || 'Men' },
  ];

  const relatedProducts = homeShuffledProducts
    .filter((p) => (p.productId || p.id) !== (productDetail?.productId || productId))
    .slice(0, 4);

  const priceVal = productDetail?.discountedPrice ?? productDetail?.price ?? 899;
  const formattedPrice = typeof priceVal === 'number' ? priceVal.toFixed(0) : priceVal;

  return (
    <main>
      <div className='container'>
        <Breadcrumb items={breadcrumbItems} />

        <section className={styles.productSection}>
          <div className={styles.galleryCol}>
            <ImageGallery images={imagesToDisplay} />
          </div>

          <div className={styles.infoCol}>
            <div className={styles.titleRow}>
              <h1 className={styles.productName}>{productDetail?.title || 'Solid Muscle Fit Polo shirt'}</h1>
              <button type='button' className={styles.shareBtn} aria-label='Share'>
                <ShareIcon width={32} height={32} />
              </button>
            </div>

            <p className={styles.subtitle}>{productDetail?.description || 'Geometric textured Knit Slim Fit Polo'}</p>

            <div className={styles.rating}>
              <svg width='18' height='18' fill='#FFC107' viewBox='0 0 24 24'>
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
              <span className={styles.ratingText}>
                {productDetail?.avgRating ? productDetail.avgRating.toFixed(1) : '4.5'} Rating
              </span>
            </div>

            <p className={styles.price}>&#8377;{formattedPrice}</p>
            <p className={styles.taxNote}>inclusive of all taxes</p>

            <ColorSelector colors={availableColors} activeColor={selectedColor} onSelect={setSelectedColor} />
            <SizeSelector sizes={availableSizes} activeSize={selectedSize} onSelect={setSelectedSize} />

            <div className={styles.actionsContainer}>
              <div className={styles.rowOne}>
                <div className={styles.quantitySelector}>
                  <button type="button" className={styles.qtyBtn} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    &minus;
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button type="button" className={styles.qtyBtnPlus} onClick={() => setQuantity((q) => q + 1)}>
                    &#43;
                  </button>
                </div>

                <button type="button" className={styles.addToBagBtn}>
                  <CartIcon width={18} height={18} />
                  Add To Bag
                </button>
              </div>

              <button type="button" className={styles.buyNowBtn}>
                Buy Now
              </button>
            </div>


            <DeliveryCheck />

            <Accordion title='Description'>
              <p>
                {productDetail?.longDescription ||
                  productDetail?.description ||
                  'A premium quality polo t-shirt with a geometric texture pattern. Made from breathable knit fabric for a comfortable slim fit. Perfect for casual and semi-formal occasions.'}
              </p>
            </Accordion>

            <Accordion title='Terms & Conditions'>
              <p>
                {productDetail?.returnPolicy ||
                  'This product is eligible for return within 7 days of delivery. Please ensure the product is unused and in its original packaging. Refunds will be processed within 5-7 business days.'}
              </p>
            </Accordion>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>You may also like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.productId || p.id} {...p} categorySlug={category} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailsPage;

