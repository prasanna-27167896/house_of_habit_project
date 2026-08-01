import { useState } from 'react';
import styles from './FillAddress.module.css';

const FillAddress = ({ initialPincode = '', onContinue }) => {
  const [formData, setFormData] = useState({
    pincode: initialPincode,
    city: '',
    state: '',
    addressLine1: '',
    addressLine2: '',
    name: '',
    phone: '',
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
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
        <h3 className={styles.title}>Add Delivery Address</h3>

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
