import styles from './OrderSuccessPage.module.css';
import OrderSuccess from '../../components/checkout/OrderSuccess/OrderSuccess';
import { MOCK_ORDER } from '../../data/checkoutData';

const OrderSuccessPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <OrderSuccess order={MOCK_ORDER} />
      </div>
    </div>
  );
};

export default OrderSuccessPage;
