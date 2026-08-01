import { useState } from 'react';
import styles from './SelectAddress.module.css';
import EditIcon from '../../../assets/icons/edit-icon.svg?react';
import DeleteIcon from '../../../assets/icons/delete-icon.svg?react';

const SelectAddress = ({ onContinue, onAddNew }) => {
  const [selectedId, setSelectedId] = useState(1);

  const mockAddresses = [
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
    }
  ];

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
          {mockAddresses.map((addr) => {
            const isSelected = selectedId === addr.id;
            return (
              <div
                key={addr.id}
                className={`${styles.card} ${isSelected ? styles.selectedCard : ''}`}
                onClick={() => setSelectedId(addr.id)}
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
        <button className={styles.continueBtn} onClick={onContinue} type="button">
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectAddress;
