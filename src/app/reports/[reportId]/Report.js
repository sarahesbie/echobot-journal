"use client";
import { useState, useEffect } from "react";
import styles from "./ReportPage.module.scss";

const Report = ({ reportId }) => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (!response.ok) throw new Error("Report not found");
        const report = await response.json();
        setReportData(report);
      } catch (err) {
        console.error("Error loading report:", err);
        setError("Failed to load report.");
      }
    }

    fetchReport();
  }, [reportId]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!reportData) return <p className={styles.loading}>Loading report...</p>;

  return (
    <div className={styles.reportContainer}>
      {reportData.sections.map((section, index) => (
        <div key={index} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <p className={styles.sectionContent}>{section.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Report;
