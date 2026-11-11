import styles from "./Spinner.module.css";

function Spinner() {
  return (
    <div className={styles.spinnerContainer} role="status">
      <div className={styles.spinner} aria-hidden="true"></div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default Spinner;
