import styles from "./Mascot.module.css";

export default function Mascot() {
  return (
    <div className={styles.mascot} aria-hidden="true">
      <div className={styles.body}>
        <div className={styles.stem} />
        <div className={styles.bowl}>
          <div className={styles.look}>
            <div className={styles.pupil} />
          </div>
        </div>
      </div>
      <div className={styles.shadow} />
    </div>
  );
}
