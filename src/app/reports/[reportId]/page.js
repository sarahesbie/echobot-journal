import Report from "./Report";
import styles from "./ReportPage.module.css";

export default function ReportPage({ params }) {
  const { reportId } = params;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.reportTitle}>Report {reportId}</h1>
      <Report reportId={reportId} />
    </div>
  );
}
