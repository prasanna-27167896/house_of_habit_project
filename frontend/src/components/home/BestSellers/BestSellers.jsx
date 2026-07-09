import { useRef } from "react";
import { bestSellers } from "../../../data/productsData";
import styles from "./BestSellers.module.css";
import Button from "../../common/Button/Button";
import ArrowIcon from "../../../assets/icons/arrow-btn.svg?react";

const BestSellers = () => {
  const gridRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // NEW: Add a ref to track the animation frame for performance
  const rafId = useRef(null);

  const handleMouseDown = (e) => {
    isDown.current = true;
    gridRef.current.classList.add(styles.active);
    startX.current = e.pageX - gridRef.current.offsetLeft;
    scrollLeft.current = gridRef.current.scrollLeft;

    // Cancel any lingering animations when you click down
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    gridRef.current.classList.remove(styles.active);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    gridRef.current.classList.remove(styles.active);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();

    const x = e.pageX - gridRef.current.offsetLeft;
    const walk = x - startX.current;

    // Cancel the previous frame if the mouse is moving incredibly fast
    if (rafId.current) cancelAnimationFrame(rafId.current);

    // NEW: Sync the scroll update to the monitor's native refresh rate
    rafId.current = requestAnimationFrame(() => {
      if (gridRef.current) {
        gridRef.current.scrollLeft = scrollLeft.current - walk;
      }
    });
  };

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
        {bestSellers.slice(0, 4).map((product) => (
          <article
            key={product.id}
            className={styles.card}
            style={{
              backgroundImage: product.backgroundImage
                ? `url(${product.backgroundImage})`
                : "none",
            }}
          >
            <div className={styles.textBlock}>
              <p className={styles.productName}>{product.name}</p>
              <p className={styles.productPrice}>
                $ {product.price.toFixed(2)}
              </p>
              <button className={styles.buyButton} type="button">
                <Button variant="light" size="sm">
                  Shop Now
                </Button>
              </button>
            </div>
            <div className={styles.imageWrapper}>
              <img src={product.image} alt={product.name} draggable="false" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
