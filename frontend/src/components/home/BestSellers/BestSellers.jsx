import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchHomeProducts } from "../../../store/slices/productSlice";
import styles from "./BestSellers.module.css";
import Button from "../../common/Button/Button";
import bestSellerCard1 from "../../../assets/images/best-seller-card1.png";
import bestSellerCard2 from "../../../assets/images/best-seller-card2.png";
import bestSellerCard3 from "../../../assets/images/best-seller-card3.png";
import bestSellerCard4 from "../../../assets/images/best-seller-card4.png";
import DummyImage from "../../../assets/images/dummy-model.png";

const cardBackgrounds = [bestSellerCard1, bestSellerCard2, bestSellerCard3, bestSellerCard4];

const getCategorySlug = (categoryTitle) => {
  const lower = (categoryTitle || '').toLowerCase();
  if (lower.includes('polo')) return 'polo-t-shirts';
  if (lower.includes('hoodie')) return 'hoodies';
  if (lower.includes('sweat')) return 'sweatshirt';
  return 'polo-t-shirts';
};

const BestSellers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { homeShuffledProducts, homeLoading } = useSelector((state) => state.product);

  const gridRef = useRef(null);
  const isDown = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    if (homeShuffledProducts.length === 0) {
      dispatch(fetchHomeProducts());
    }
  }, [dispatch, homeShuffledProducts.length]);

  const handleMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - (gridRef.current?.offsetLeft || 0);
    scrollLeft.current = gridRef.current?.scrollLeft || 0;

    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    isDragging.current = false;
    if (gridRef.current) gridRef.current.classList.remove(styles.active);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (gridRef.current) gridRef.current.classList.remove(styles.active);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;

    const x = e.pageX - (gridRef.current?.offsetLeft || 0);
    const walk = x - startX.current;

    if (Math.abs(walk) > 5) {
      isDragging.current = true;
      if (gridRef.current) gridRef.current.classList.add(styles.active);
    } else {
      return;
    }

    e.preventDefault();

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      if (gridRef.current) {
        gridRef.current.scrollLeft = scrollLeft.current - walk;
      }
    });
  };

  const handleNavigate = (pId, slug, e) => {
    if (isDragging.current) return;
    if (pId) {
      navigate(`/shop/${slug}/${pId}`);
    }
  };

  const displayProducts = homeShuffledProducts.slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Best Sellers</h2>
        <p className={styles.subtitle}>
          Contemporary clothing crafted for everyday confidence.
        </p>
      </div>

      <div
        className={styles.grid}
        ref={gridRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {homeLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}>
              <div className={styles.skeletonTextBlock}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonPrice} />
                <div className={styles.skeletonBtn} />
              </div>
              <div className={styles.skeletonImage} />
            </div>
          ))
        ) : (
          displayProducts.map((product, idx) => {
            const bgImage = cardBackgrounds[idx % cardBackgrounds.length];
            const priceVal = product.discountedPrice ?? product.price ?? 0;
            const slug = getCategorySlug(product.category?.categoryTitle);
            const pId = product.productId || product.id;

            return (
              <article
                key={pId}
                className={styles.card}
                style={{
                  backgroundImage: bgImage ? `url(${bgImage})` : "none",
                }}
                onClick={(e) => handleNavigate(pId, slug, e)}
              >
                <div className={styles.textBlock}>
                  <p className={styles.productName}>{product.title || product.name}</p>
                  <p className={styles.productPrice}>
                    ₹ {typeof priceVal === 'number' ? priceVal.toFixed(2) : Number(priceVal).toFixed(2)}
                  </p>
                  <div className={styles.buyButton}>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(pId, slug, e);
                      }}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
                <div className={styles.imageWrapper}>
                  <img
                    src={product.imageUrl || product.image || DummyImage}
                    alt={product.title || product.name}
                    draggable="false"
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default BestSellers;


