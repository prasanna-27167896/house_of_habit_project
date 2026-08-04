import { useState, useEffect } from 'react';
import styles from './FillAddress.module.css';

const FillAddress = ({ initialPincode = '', onContinue, initialAddress = null }) => {
  const [formData, setFormData] = useState({
    pincode: initialAddress ? (initialAddress.pincode || '') : initialPincode,
    city: initialAddress ? (initialAddress.city || '') : '',
    state: initialAddress ? (initialAddress.state || '') : '',
    addressLine1: initialAddress ? (initialAddress.addressLine1 || '') : '',
    addressLine2: initialAddress ? (initialAddress.addressLine2 || '') : '',
    name: initialAddress ? (initialAddress.fullName || initialAddress.name || '') : '',
    phone: initialAddress ? (initialAddress.phone || '') : '',
  });

  const fetchPincodeDetails = async (pin) => {
    if (pin && pin.trim().length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: postOffice.District || postOffice.Division || '',
            state: postOffice.State || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching pincode details:', err);
      }
    }
  };

  useEffect(() => {
    if (initialPincode && initialPincode.trim().length === 6) {
      fetchPincodeDetails(initialPincode);
    }
  }, [initialPincode]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (field === 'pincode' && val.trim().length === 6) {
      fetchPincodeDetails(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onContinue) {
      onContinue(formData);
    }
  };

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      {/* Scrollable Form Body */}
      <div className={styles.body}>
        <h3 className={styles.title}>
          {initialAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
        </h3>

        <div className={styles.formFields}>
          {/* Pincode */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Pincode <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your Pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              pattern="^[0-9]{6}$"
              maxLength={6}
              title="Pincode must be exactly 6 digits"
              required
            />
          </div>

          {/* City & State (Row) */}
          <div className={styles.row}>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>
                City <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                minLength={2}
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className={styles.label}>
                State <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                minLength={2}
                required
              />
            </div>
          </div>

          {/* Address House/Building */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Address (House No, Building, Street, Area) <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter Flat or house No"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              minLength={5}
              required
            />
          </div>

          {/* Apartment, Sector, Village */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Apartment, Area, Sector, Village <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter address"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              minLength={2}
              required
            />
          </div>

          {/* Section: Customer Information */}
          <h4 className={styles.sectionTitle}>Customer information</h4>

          {/* Name */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter Your name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              pattern="^[A-Za-z\s]{2,}$"
              title="Name must contain at least 2 letters"
              required
            />
          </div>

          {/* Mobile No */}
          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              Mobile No <span className={styles.required}>*</span>
            </label>
            <input
              type="tel"
              className={styles.input}
              placeholder="Enter Your mobile no"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              pattern="^[6-9][0-9]{9}$"
              maxLength={10}
              title="Mobile number must be a 10-digit number starting with 6, 7, 8, or 9"
              required
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      <div className={styles.footer}>
        <button className={styles.continueBtn} type="submit">
          Continue
        </button>
      </div>
    </form>
  );
};

export default FillAddress;
