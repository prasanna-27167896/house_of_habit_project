import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import ProductDetailsSkeleton from '../../components/product/ProductDetailsSkeleton/ProductDetailsSkeleton';
import DummyImage from '../../assets/images/dummy-model.png';
import ShareIcon from '../../assets/icons/share-icon.svg?react';
import CartIcon from '../../assets/icons/cart-add.svg?react';
import { fetchProductDetail, fetchHomeProducts, clearProductDetail } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const DEFAULT_COLORS = [
  { name: 'Brown', image: DummyImage },
  { name: 'Navy', image: DummyImage },
  { name: 'Black', image: DummyImage },
  { name: 'White', image: DummyImage },
];

const ProductDetailsPage = () => {
  const { category, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { productDetail, productDetailLoading, homeShuffledProducts } = useSelector((state) => state.product);
  const { addingVariants = [] } = useSelector((state) => state.cart);

  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const [localIsAdding, setLocalIsAdding] = useState(false);

  const matchedVariant =
    productDetail?.variants?.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    ) || productDetail?.variants?.[0];

  const isPending = localIsAdding || isBuying;

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

  const imagesToDisplay = (galleryImages.length > 0 ? galleryImages : [DummyImage, DummyImage, DummyImage]).slice(0, 3);

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

  const handleAddToCart = async () => {
    if (!productDetail || localIsAdding) return;
    const variantsList = productDetail.variants || [];
    const matchedVariant =
      variantsList.find(
        (v) =>
          (!selectedSize || v.size === selectedSize) &&
          (!selectedColor || v.color === selectedColor)
      ) || variantsList[0];

    if (matchedVariant) {
      setLocalIsAdding(true);
      try {
        await dispatch(addToCart({ variantId: matchedVariant.variantId, quantity }));
      } catch (err) {
        console.error(err);
      } finally {
        setLocalIsAdding(false);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!productDetail || isBuying) return;
    const variantsList = productDetail.variants || [];
    const matchedVariant =
      variantsList.find(
        (v) =>
          (!selectedSize || v.size === selectedSize) &&
          (!selectedColor || v.color === selectedColor)
      ) || variantsList[0];

    if (matchedVariant) {
      navigate('/checkout', {
        state: {
          backgroundLocation: location,
          buyNowItem: {
            variantId: matchedVariant.variantId,
            quantity,
            size: selectedSize || matchedVariant.size || 'S',
            price: priceVal,
            originalPrice: productDetail.price || priceVal,
            name: productDetail.title,
            image: productDetail.imageUrl || (productDetail.images && productDetail.images[0]) || DummyImage
          }
        }
      });
    }
  };



  if (productDetailLoading && !productDetail) {
    return <ProductDetailsSkeleton />;
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
      <div className={styles.container}>
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

            {/* <ColorSelector colors={availableColors} activeColor={selectedColor} onSelect={setSelectedColor} /> */}
            <SizeSelector sizes={availableSizes} activeSize={selectedSize} onSelect={setSelectedSize} />

            <div className={styles.actionsContainer}>
              <div className={styles.rowOne}>
                <div className={styles.quantitySelector}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isPending}
                  >
                    &minus;
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtnPlus}
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isPending}
                  >
                    &#43;
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.addToBagBtn}
                  onClick={handleAddToCart}
                  disabled={isPending}
                  style={{ position: 'relative' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'inherit', visibility: localIsAdding ? 'hidden' : 'visible', opacity: localIsAdding ? 0 : 1 }}>
                    <CartIcon width={32} height={32} />
                    Add To Bag
                  </span>
                  {localIsAdding && (
                    <div className="absolute-loader">
                      <div className="dots-loading">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </button>
              </div>

              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={isPending}
                style={{ position: 'relative' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', visibility: isBuying ? 'hidden' : 'visible', opacity: isBuying ? 0 : 1 }}>
                  Buy Now
                </span>
                {isBuying && (
                  <div className="absolute-loader" style={{ color: '#ff5f15' }}>
                    <div className="dots-loading">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
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

