import styles from "./OverviewSummary.module.css";

export const OverviewSummary = () => {
  return (
    <p className={styles.summary}>
      ROBOKOP is an open-source, modular, biomedical knowledge graph–based system that includes the 
      ROBOKOP biomedical knowledge graph, a user interface,  and a variety of supporting resources, 
      including tools and services to support deep exploration of the ROBOKOP KG and each of its 
      underlying primary knowledge sources.
    </p>
  );
};
