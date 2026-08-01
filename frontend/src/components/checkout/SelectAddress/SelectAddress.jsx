import { useState } from 'react';
import styles from './SelectAddress.module.css';
import EditIcon from '../../../assets/icons/edit-icon.svg?react';
import DeleteIcon from '../../../assets/icons/delete-icon.svg?react';

const SelectAddress = ({ onContinue, onAddNew }) => {
  const [selectedId, setSelectedId] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      addressLine1: '#45, 2nd Floor, MG Road,',
      addressLine2: 'BANGALORE, Karnataka 560001',
      phone: '9876543210',
      payOnDeliveryAvailable: false,
      isDefault: true,
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      addressLine1: '#123, 5th Cross, Indiranagar,',
      addressLine2: 'BANGALORE, Karnataka 560038',
      phone: '9876543210',
      payOnDeliveryAvailable: true,
      isDefault: false,
    },
    {
      id: 3,
      name: 'Siddu',
      addressLine1: '8/21 chandra layout vijayanagar, bangalore',
      addressLine2: 'karnataka, 560040',
      phone: '+91 9620099167',
      payOnDeliveryAvailable: true,
      isDefault: false,
    }
  ]);

  const handleSelectAddress = (id) => {
    if (isAnimating) return;
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

  const handleContinue = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedId);
    if (onContinue && selectedAddress) {
      onContinue(selectedAddress);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Select Delivery Address</h3>
        <button className={styles.addBtn} onClick={onAddNew} type="button">
          Add New Address
        </button>
      </div>

      {/* Main Body */}
      <div className={styles.body}>
        <h4 className={styles.subtitle}>Default Address</h4>

        <div className={styles.addressList}>
          {addresses.map((addr) => {
            const isSelected = selectedId === addr.id;
            return (
              <div
                key={addr.id}
                data-address-id={addr.id}
                className={`${styles.card} ${isSelected ? styles.selectedCard : ''}`}
                onClick={() => handleSelectAddress(addr.id)}
              >
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
                    <button className={styles.editBtn} aria-label="Edit address">
                      <EditIcon className={styles.editIcon} />
                    </button>
                    <button className={styles.deleteBtn} aria-label="Delete address">
                      <DeleteIcon className={styles.deleteIcon} />
                    </button>
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
          })}
        </div>
      </div>

      {/* Footer Continue Button */}
      <div className={styles.footer}>
        <button className={styles.continueBtn} onClick={handleContinue} type="button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectAddress;
