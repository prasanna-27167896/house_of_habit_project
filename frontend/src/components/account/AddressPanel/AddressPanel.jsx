import { useState, useEffect } from 'react';
import styles from './AddressPanel.module.css';
import PanelHeader from '../PanelHeader/PanelHeader';
import FormField from '../../common/FormField/FormField';
import Button from '../../common/Button/Button';
import LocationIcon from '../../../assets/icons/location-icon.svg?react';
import EditIcon from '../../../assets/icons/edit-icon.svg?react';
import DeleteIcon from '../../../assets/icons/delete-icon.svg?react';
import * as addressService from '../../../services/addressService';
import Loader from '../../common/Loader/Loader';
import DeleteAddressPopup from '../../common/Popup/DeleteAddressPopup';

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

/* Helper: convert backend address object → frontend shape */
const toFrontend = (a) => ({
  id: a.addressId,
  name: a.fullName,
  mobile: a.phone,
  address: a.addressLine1,
  locality: a.addressLine2 || '',
  state: a.state,
  pincode: a.pincode,
  isDefault: a.isDefault,
});

/* Helper: convert frontend form data → backend payload */
const toBackend = (f) => ({
  fullName: f.name,
  phone: f.mobile,
  addressLine1: f.address,
  addressLine2: f.locality || undefined,
  city: f.locality || f.state,
  state: f.state,
  pincode: f.pincode,
  isDefault: f.isDefault,
});

/* ── Address Card ── */
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => (
  <div className={styles.card}>
    <div className={styles.cardTop}>
      <div className={styles.cardName}>
        {address.name}
        {address.isDefault && <span className={styles.defaultBadge}>Default</span>}
      </div>
      <div className={styles.cardActions}>
        <button className={styles.iconBtn} onClick={() => onEdit(address)} aria-label='Edit'>
          <EditIcon width={24} height={24} />
        </button>
        {!address.isDefault && (
          <button className={`${styles.iconBtn} ${styles.iconBtnDelete}`} onClick={() => onDelete(address)} aria-label='Delete'>
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

/* ── Add / Edit Address Form ── */
const AddressForm = ({ onBack, onSave, initialData, saving }) => {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const isEdit = !!initialData?.id;

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <PanelHeader
        title={isEdit ? 'Edit Address' : 'Add Address'}
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
          <button type='submit' className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

/* ── Main AddressPanel ── */
const AddressPanel = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      const list = Array.isArray(data) ? data : [];
      setAddresses(list.map(toFrontend));
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      const payload = toBackend(formData);

      if (editData?.id) {
        await addressService.updateAddress(editData.id, payload);
      } else {
        await addressService.createAddress(payload);
      }
      await fetchAddresses();
      setShowForm(false);
      setEditData(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save address.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditData(address);
    setShowForm(true);
  };

  const handleDeleteClick = (address) => {
    setAddressToDelete(address);
    setDeletePopupOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      setError(null);
      await addressService.deleteAddress(addressToDelete.id);
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete address.';
      setError(msg);
    } finally {
      setDeletePopupOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setError(null);
      await addressService.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to set default address.';
      setError(msg);
    }
  };

  if (showForm) {
    return (
      <div className={styles.panel}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <AddressForm
          onBack={() => { setShowForm(false); setEditData(null); }}
          onSave={handleSave}
          initialData={editData}
          saving={saving}
        />
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

      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.emptyState}>
          <Loader loadingText="Loading addresses..." />
        </div>
      ) : addresses.length === 0 ? (
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
            <AddressCard key={a.id} address={a} onEdit={handleEdit} onDelete={handleDeleteClick} onSetDefault={handleSetDefault} />
          ))}
        </div>
      )}

      <DeleteAddressPopup
        isOpen={deletePopupOpen}
        onClose={() => { setDeletePopupOpen(false); setAddressToDelete(null); }}
        onConfirm={handleConfirmDelete}
        addressString={
          addressToDelete
            ? `${addressToDelete.address}, ${addressToDelete.locality ? addressToDelete.locality + ', ' : ''}${addressToDelete.state} ${addressToDelete.pincode} ${addressToDelete.mobile}`
            : ''
        }
      />
    </div>
  );
};

export default AddressPanel;
