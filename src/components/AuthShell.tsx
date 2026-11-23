import styles from "./auth.module.css";

export default function AuthShell({
  title, cardTitle, children, footer,
}: { title: string; cardTitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className={styles.screen}>
      <div className={styles.hero}>
        <h1>{title}</h1>
        <div className={styles.awning} aria-hidden>
          <span /><span /><span /><span />
        </div>
      </div>
      <section className={styles.card}>
        <h2>{cardTitle}</h2>
        {children}
        {footer && <p className={styles.footer}>{footer}</p>}
      </section>
    </main>
  );
}
