import { useState, useEffect } from 'react';
import styles from './SelectAddress.module.css';
import EditIcon from '../../../assets/icons/edit-icon.svg?react';
import DeleteIcon from '../../../assets/icons/delete-icon.svg?react';
import * as addressService from '../../../services/addressService';
import loaderStyles from '../../common/Loader/Loader.module.css';

const SelectAddress = ({ onContinue, onAddNew, onEdit }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      // Format backend response to match UI format
      const formatted = data.map(addr => ({
        id: addr.addressId || addr.id,
        name: addr.fullName,
        addressLine1: addr.addressLine1,
        addressLine2: `${addr.city}, ${addr.state} ${addr.pincode}`,
        phone: addr.phone,
        payOnDeliveryAvailable: true, // Backend allows COD for all verified addresses
        isDefault: addr.isDefault,
        raw: addr
      }));
      setAddresses(formatted);
      
      if (formatted.length > 0) {
        // Default to the default address or the first one in the list
        const defaultAddr = formatted.find(a => a.isDefault) || formatted[0];
        setSelectedId(defaultAddr.id);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSelectAddress = (id) => {
    if (isAnimating || deletingId) return;
    setSelectedId(id);

    const index = addresses.findIndex(addr => addr.id === id);
    if (index === 0) return;

    // Retrieve active DOM nodes for FLIP animation
    const card0 = document.querySelector(`[data-address-id="${addresses[0].id}"]`);
    const cardI = document.querySelector(`[data-address-id="${id}"]`);

    if (card0 && cardI) {
      setIsAnimating(true);

      const rect0 = card0.getBoundingClientRect();
      const rectI = cardI.getBoundingClientRect();
      const deltaY = rect0.top - rectI.top;

      // Apply transition style
      card0.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      cardI.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';

      card0.style.transform = `translateY(${-deltaY}px)`;
      cardI.style.transform = `translateY(${deltaY}px)`;

      // Complete layout updates after translation completes
      setTimeout(() => {
        card0.style.transition = 'none';
        cardI.style.transition = 'none';
        card0.style.transform = 'none';
        cardI.style.transform = 'none';

        setAddresses(prev => {
          const updated = [...prev];
          const temp = updated[0];
          updated[0] = updated[index];
          updated[index] = temp;
          return updated;
        });

        setIsAnimating(false);
      }, 800);
    } else {
      // Fallback update
      setAddresses(prev => {
        const updated = [...prev];
        const temp = updated[0];
        updated[0] = updated[index];
        updated[index] = temp;
        return updated;
      });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await addressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinue = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedId);
    if (onContinue && selectedAddress) {
      onContinue({
        ...selectedAddress.raw,
        addressId: selectedAddress.id,
        name: selectedAddress.name
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Select Delivery Address</h3>
        <button className={styles.addBtn} onClick={onAddNew} disabled={loading || !!deletingId} type="button">
          Add New Address
        </button>
      </div>

      {/* Main Body */}
      <div className={styles.body}>
        <h4 className={styles.subtitle}>Default Address</h4>

        {loading && !deletingId ? (
          <div className={styles.loadingContainer}>
            <span className={loaderStyles.loader} aria-label="Loading"></span>
          </div>
        ) : (
          <div className={styles.addressList}>
            {addresses.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No saved addresses found. Please add one to continue.</p>
              </div>
            ) : (
              addresses.map((addr) => {
                const isSelected = selectedId === addr.id;
                const isDeleting = deletingId === addr.id;
                return (
                  <div
                    key={addr.id}
                    data-address-id={addr.id}
                    className={`${styles.card} ${isSelected ? styles.selectedCard : ''}`}
                    onClick={() => handleSelectAddress(addr.id)}
                  >
                    {isDeleting && (
                      <div className={styles.cardLoaderOverlay}>
                        <span className={loaderStyles.loader} style={{ width: '20px', height: '20px', borderWidth: '2px' }} aria-label="Loading"></span>
                      </div>
                    )}
                    <div className={styles.cardHeader}>
                      <div className={styles.leftGroup}>
                        {/* Custom Checkbox */}
                        <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                          {isSelected && <span className={styles.checkmark}>✓</span>}
                        </div>
                        <span className={styles.name}>{addr.name}</span>
                        {isSelected && (
                          <span className={styles.badge}>Selected</span>
                        )}
                      </div>

                      <div className={styles.rightGroup} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={styles.editBtn}
                          aria-label="Edit address"
                          disabled={!!deletingId}
                          type="button"
                          onClick={() => onEdit && onEdit(addr.raw)}
                        >
                          <EditIcon className={styles.editIcon} />
                        </button>
                        {!addr.isDefault && (
                          <button 
                            className={styles.deleteBtn} 
                            aria-label="Delete address" 
                            onClick={() => handleDeleteAddress(addr.id)}
                            disabled={!!deletingId}
                            type="button"
                          >
                            <DeleteIcon className={styles.deleteIcon} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.addressLine}>{addr.addressLine1}</p>
                      <p className={styles.addressLine}>{addr.addressLine2}</p>
                      <p className={styles.phone}>{addr.phone}</p>

                      {!addr.payOnDeliveryAvailable && (
                        <p className={styles.podNote}>
                          <span className={styles.bullet}>•</span> Pay on delivery not available
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Continue Button */}
      <div className={styles.footer}>
        <button 
          className={styles.continueBtn} 
          onClick={handleContinue} 
          disabled={loading || !!deletingId || addresses.length === 0} 
          type="button"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectAddress;
