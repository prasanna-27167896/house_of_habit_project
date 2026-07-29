import { useState } from 'react';
import styles from './AddressModal.module.css';
import FormField from '../../common/FormField/FormField';
import Loader from '../../common/Loader/Loader';

const INITIAL_FORM = {
  pincode: '',
  city: '',
  state: '',
  address1: '',
  address2: '',
  name: '',
  mobile: '',
};

const AddressModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1=pincode, 2=loading, 3=full form
  const [form, setForm] = useState(INITIAL_FORM);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePincodeSubmit = async () => {
    if (!form.pincode || form.pincode.length < 6) return;
    setStep(2);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const { Block, State } = data[0].PostOffice[0];
        setForm((prev) => ({
          ...prev,
          city: Block || '',
          state: State || '',
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          city: '',
          state: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      setForm((prev) => ({
        ...prev,
        city: '',
        state: '',
      }));
    } finally {
      setStep(3);
    }
  };

  const handleFullSubmit = () => {
    if (!form.address1 || !form.name || !form.mobile) return;
    onSubmit?.(form);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setForm(INITIAL_FORM);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          ✕
        </button>

        <h2 className={styles.heading}>Add Delivery Address</h2>

        {/* Step 1: Pincode */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <FormField
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              isEditing
              placeholder="Enter your Pincode"
            />
            <button className={styles.continueBtn} onClick={handlePincodeSubmit} type="button">
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 2 && (
          <div className={styles.loadingWrap}>
            <p className={styles.waitText}>Please Wait...</p>
            <Loader />
          </div>
        )}

        {/* Step 3: Full form */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <FormField
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              isEditing
              required
            />

            <div className={styles.twoCol}>
              <FormField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                isEditing
                required
              />
              <FormField
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                isEditing
                required
              />
            </div>

            <FormField
              label="Address (House No, Building, Street, Area)"
              name="address1"
              value={form.address1}
              onChange={handleChange}
              isEditing
              required
              placeholder="Enter Flat or house No"
            />

            <FormField
              label="Apartment, Area, Sector, Village"
              name="address2"
              value={form.address2}
              onChange={handleChange}
              isEditing
              required
              placeholder="Enter address"
            />

            <h3 className={styles.sectionTitle}>Customer information</h3>

            <FormField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              isEditing
              required
              placeholder="Enter Your name"
            />

            <FormField
              label="Mobile No"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              isEditing
              required
              placeholder="Enter Your mobile no"
              type="tel"
            />

            <button className={styles.continueBtn} onClick={handleFullSubmit} type="button">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressModal;
