import { useParams, Navigate } from 'react-router-dom';
import { policyData } from '../../data/policyData';
import styles from './PolicyPage.module.css';

const PolicyPage = ({ slug: propSlug }) => {
  const { slug: routeSlug } = useParams();
  const slug = propSlug || routeSlug;

  const data = policyData[slug];

  if (!data) {
    return <Navigate to="/" replace />;
  }

  // Helper to render section items, rendering list items as actual <ul> lists
  const renderItems = (items) => {
    const elements = [];
    let currentList = [];

    items.forEach((item, index) => {
      if (item.startsWith('- ')) {
        currentList.push(item.substring(2));
      } else {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className={styles.list}>
              {currentList.map((li, liIdx) => (
                <li key={liIdx} className={styles.listItem}>{li}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={`p-${index}`} className={styles.paragraph}>
            {item}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-final`} className={styles.list}>
          {currentList.map((li, liIdx) => (
            <li key={liIdx} className={styles.listItem}>{li}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>
          {data.titleNormal} <span className={styles.highlight}>{data.titleHighlight}</span>
        </h1>
        {data.subtitle && <p className={styles.subtitle}>{data.subtitle}</p>}
        {data.lastUpdated && <div className={styles.lastUpdated}>{data.lastUpdated}</div>}
      </div>

      <div className={styles.divider} />

      <div className={styles.contentBody}>
        {data.intro && <p className={styles.intro}>{data.intro}</p>}
        
        {data.sections.map((section, idx) => (
          <section key={idx} className={styles.section}>
            {section.title && <h2 className={styles.sectionTitle}>{section.title}</h2>}
            <div className={styles.sectionContent}>
              {renderItems(section.items)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default PolicyPage;
