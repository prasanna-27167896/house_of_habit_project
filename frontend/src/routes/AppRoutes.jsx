import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Home';
import ShopPage from '../pages/Shop/ShopPage';
import ProductDetailsPage from '../pages/Product/ProductDetailsPage';
import ContactPage from '../pages/Contact/ContactPage';
import AccountPage from '../pages/Account/AccountPage';
import OrderDetailPage from '../pages/Account/OrderDetailPage';
import CancelOrderPage from '../pages/Account/CancelOrderPage';
import ReturnItemPage from '../pages/Account/ReturnItemPage';
import SizeExchangePage from '../pages/Account/SizeExchangePage';
import PolicyPage from '../pages/PolicyPage/PolicyPage';

const AppRoutes = ({ location }) => (
  <Routes location={location}>
    <Route path='/' element={<Home />} />
    <Route path='/contact' element={<ContactPage />} />
    <Route path='/account' element={<AccountPage />} />
    <Route path='/account/order/:orderId' element={<OrderDetailPage />} />
    <Route path='/account/order/:orderId/cancel' element={<CancelOrderPage />} />
    <Route path='/account/order/:orderId/return' element={<ReturnItemPage />} />
    <Route path='/account/order/:orderId/size-exchange' element={<SizeExchangePage />} />
    <Route path='/checkout' element={null} />
    <Route path='/shop/:category' element={<ShopPage />} />
    <Route path='/shop/:category/:productId' element={<ProductDetailsPage />} />
    
    {/* Policy Routes */}
    <Route path='/terms-conditions' element={<PolicyPage slug="terms-conditions" />} />
    <Route path='/privacy-policy' element={<PolicyPage slug="privacy-policy" />} />
    <Route path='/return-policy' element={<PolicyPage slug="return-policy" />} />
    <Route path='/refund-policy' element={<PolicyPage slug="refund-policy" />} />
    <Route path='/shipping-policy' element={<PolicyPage slug="shipping-policy" />} />
    <Route path='/cancellation-policy' element={<PolicyPage slug="cancellation-policy" />} />

    <Route path='*' element={<Navigate to='/' replace />} />
  </Routes>
);

export default AppRoutes;
