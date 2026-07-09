import styles from './FormField.module.css';

const FormField = ({ label, name, type = 'text', value, onChange, isEditing = false, required = false, placeholder = '' }) => (
  <div className={styles.wrapper}>
    <span className={styles.label}>
      {label}
      {required && <span className={styles.star}> *</span>}
    </span>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
        required={required}
      />
    ) : (
      <div className={styles.display}>{value}</div>
    )}
  </div>
);

export default FormField;
