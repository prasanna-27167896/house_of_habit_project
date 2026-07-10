import { useState, useRef, useEffect } from 'react';
import styles from './ContactPage.module.css';
import { contactFaqs } from '../../data/contactData';
import Button from '../../components/common/Button/Button';
import ArrowIconWhite from '../../assets/icons/arrow-icon-white.svg?react';
import { Hero } from '../../components/common/Hero/Hero';

import ContactIcon from '../../assets/images/contact-us-icon.png';
import ContactIllustrationImg from '../../assets/images/contact-illustration-img.png';

const ContactIllustration = () => (
  <div className={styles.illustrationWrapper}>
    <span className={styles.illustration}>
      <img src={ContactIllustrationImg} alt='Contact Illustration' />
    </span>
    <div className={styles.supportRow}>
      <div className={styles.qrBlock}>
        <svg className={styles.qrCode} viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'>
          <rect width='80' height='80' fill='#fff' />
          <rect x='4' y='4' width='24' height='24' rx='2' stroke='#2f2f2f' strokeWidth='2' fill='none' />
          <rect x='10' y='10' width='12' height='12' fill='#2f2f2f' />
          <rect x='52' y='4' width='24' height='24' rx='2' stroke='#2f2f2f' strokeWidth='2' fill='none' />
          <rect x='58' y='10' width='12' height='12' fill='#2f2f2f' />
          <rect x='4' y='52' width='24' height='24' rx='2' stroke='#2f2f2f' strokeWidth='2' fill='none' />
          <rect x='10' y='58' width='12' height='12' fill='#2f2f2f' />
          <rect x='34' y='4' width='6' height='6' fill='#2f2f2f' />
          <rect x='34' y='16' width='6' height='6' fill='#2f2f2f' />
          <rect x='44' y='34' width='6' height='6' fill='#2f2f2f' />
          <rect x='34' y='34' width='6' height='6' fill='#2f2f2f' />
          <rect x='56' y='34' width='6' height='6' fill='#2f2f2f' />
          <rect x='68' y='34' width='6' height='6' fill='#2f2f2f' />
          <rect x='56' y='44' width='6' height='6' fill='#2f2f2f' />
          <rect x='68' y='56' width='6' height='6' fill='#2f2f2f' />
          <rect x='56' y='68' width='18' height='6' fill='#2f2f2f' />
          <rect x='34' y='52' width='6' height='12' fill='#2f2f2f' />
          <rect x='4' y='34' width='6' height='12' fill='#2f2f2f' />
          <rect x='16' y='34' width='6' height='6' fill='#2f2f2f' />
        </svg>
        <p className={styles.supportTitle}>WhatsApp Support</p>
        <p className={styles.supportText}>We're dedicated to offering personalized guidance.</p>
      </div>

      <div className={styles.emailBlock}>
        <p className={styles.emailLabel}>Email :</p>
        <a href='mailto:contact@houseofhabit.com' className={styles.emailLink}>
          contact@houseofhabit.com
        </a>
      </div>
    </div>
  </div>
);

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>How can we help you today?</h2>

      <label className={styles.label}>Your Full Name</label>
      <input
        type='text'
        name='name'
        placeholder='Enter your full name'
        className={styles.input}
        value={formData.name}
        onChange={handleChange}
      />

      <label className={styles.label}>Your Email</label>
      <input
        type='email'
        name='email'
        placeholder='Enter your email address'
        className={styles.input}
        value={formData.email}
        onChange={handleChange}
      />

      <label className={styles.label}>Message</label>
      <textarea
        name='message'
        placeholder='Write something here...'
        className={styles.textarea}
        rows={5}
        value={formData.message}
        onChange={handleChange}
      />

      <div className={styles.formAction}>
        <Button bgColor={'#1e1e1e'} pillColor={'#ff5f15'} type='submit'>
          Send Message
        </Button>
      </div>
    </form>
  );
};

const FaqItem = ({ question, answer, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const answerRef = useRef(null);
  const [contentHeight, setContentHeight] = useState('0px');

  useEffect(() => {
    if (!answerRef.current) return;
    const scrollHeight = answerRef.current.scrollHeight;
    setContentHeight(open ? `${scrollHeight}px` : '0px');
  }, [open, answer]);

  return (
    <div className={styles.faqItem}>
      <button type='button' className={styles.faqHeader} onClick={() => setOpen((prev) => !prev)}>
        <div className={styles.faqContent}>
          <span className={styles.faqQuestion}>{question}</span>
          <div className={styles.faqAnswerWrapper} style={{ maxHeight: contentHeight }}>
            <p ref={answerRef} className={styles.faqAnswer}>
              {answer}
            </p>
          </div>
        </div>
        <span className={`${styles.faqToggle} ${open ? styles.faqToggleOpen : ''}`}>+</span>
      </button>
    </div>
  );
};

const ContactPage = () => (
  <main>
    <div className='container'>
      <Hero
        title='Contact us'
        image={ContactIcon}
        subtitle="We're here for you — reach out about orders, sizing, collaborations, or anything else on your mind."
      />

      <section className={styles.contactSection}>
        <ContactIllustration />
        <ContactForm />
      </section>

      <section className={styles.faqSection}>
        <h2 className={styles.faqTitle}>
          Frequently
          <br />
          asked questions
        </h2>
        <div className={styles.faqList}>
          {contactFaqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} defaultOpen={i === 0} />
          ))}
        </div>
      </section>
    </div>
  </main>
);

export default ContactPage;
