import { useState } from 'react';
import styles from './AddressPanel.module.css';
import PanelHeader from '../PanelHeader/PanelHeader';
import FormField from '../../common/FormField/FormField';
import Button from '../../common/Button/Button';
import LocationIcon from '../../../assets/icons/location-icon.svg?react';
import EditIcon from '../../../assets/icons/edit-icon.svg?react';
import DeleteIcon from '../../../assets/icons/delete-icon.svg?react';

const BackIcon = () => (
  <svg
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='15 18 9 12 15 6' />
  </svg>
);

const EMPTY_FORM = { pincode: '', address: '', locality: '', state: '', name: '', mobile: '', isDefault: false };

/* ── Address Card ── */
const AddressCard = ({ address, onDelete }) => (
  <div className={styles.card}>
    <div className={styles.cardTop}>
      <div className={styles.cardName}>
        {address.name}
        {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
      </div>
      <div className={styles.cardActions}>
        <button className={styles.iconBtn} aria-label='Edit'>
          <EditIcon width={24} height={24} />
        </button>
        {!address.isDefault && (
          <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => onDelete(address.id)} aria-label='Delete'>
            <DeleteIcon width={24} height={24} />
          </button>
        )}
      </div>
    </div>
    <p className={styles.cardAddress}>
      {address.address},<br />
      {address.locality ? `${address.locality}, ` : ''}
      {address.state} {address.pincode}
    </p>
    <p className={styles.cardMobile}>{address.mobile}</p>
  </div>
);

/* ── Add Address Form ── */
const AddressForm = ({ onBack, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...form, id: Date.now() });
  };

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <PanelHeader
        title='Add Address'
        subtitle='Manage your saved delivery addresses'
        prefix={
          <button type='button' className={styles.backBtn} onClick={onBack}>
            <BackIcon />
          </button>
        }
      />

      <div className={styles.formBody}>
        <p className={styles.sectionLabel}>Personal Details</p>

        <div className={styles.formGrid}>
          <FormField
            label='Pincode'
            name='pincode'
            value={form.pincode}
            onChange={handleChange}
            isEditing
            placeholder='Enter your Pincode'
            required
          />
          <FormField
            label='Address (House No, Building, Street, Area)'
            name='address'
            value={form.address}
            onChange={handleChange}
            isEditing
            placeholder='Enter your Address'
            required
          />
          <FormField
            label='Locality / Town'
            name='locality'
            value={form.locality}
            onChange={handleChange}
            isEditing
            placeholder='Enter your Locality'
            required
          />
          <FormField
            label='State'
            name='state'
            value={form.state}
            onChange={handleChange}
            isEditing
            placeholder='Enter your State'
            required
          />
          <FormField label='Name' name='name' value={form.name} onChange={handleChange} isEditing placeholder='Enter your name' required />
          <FormField
            label='Mobile Number'
            name='mobile'
            type='tel'
            value={form.mobile}
            onChange={handleChange}
            isEditing
            placeholder='Enter your mobile number'
            required
          />
        </div>

        <label className={styles.checkboxRow}>
          <input type='checkbox' name='isDefault' checked={form.isDefault} onChange={handleChange} className={styles.checkbox} />
          Make this as default address
        </label>

        <div className={styles.saveRow}>
          <button type='submit' className={styles.saveBtn}>
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

/* ── Main AddressPanel ── */
const AddressPanel = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (newAddress) => {
    setAddresses((prev) => {
      const updated = newAddress.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...updated, newAddress];
    });
    setShowForm(false);
  };

  const handleDelete = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  if (showForm) {
    return (
      <div className={styles.panel}>
        <AddressForm onBack={() => setShowForm(false)} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <PanelHeader
        title='My Addresses'
        subtitle='Manage your saved delivery addresses'
        action={
          addresses.length > 0 ? (
            <button className={styles.addOutlineBtn} onClick={() => setShowForm(true)}>
              <span>+</span>
              <p>Add Address</p>
            </button>
          ) : null
        }
      />

      {addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <LocationIcon width={180} height={180} />
          <p className={styles.emptyText}>Start by Adding a Location</p>
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>
            <span>+</span>
            <p>Add Address</p>
          </button>
        </div>
      ) : (
        <div className={styles.addressList}>
          {addresses.map((a) => (
            <AddressCard key={a.id} address={a} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressPanel;
