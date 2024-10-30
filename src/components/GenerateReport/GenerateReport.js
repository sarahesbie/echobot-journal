"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateReport({ documentContent }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generateReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent }),
      });

      const data = await response.json();
      if (data.status === "success") {
        router.push(`/reports/${data.reportId}`);
      } else {
        setError(data.message || "Error generating report.");
      }
    } catch (err) {
      setError("Network error while generating report.");
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={handleGenerateReport}
        disabled={loading || !documentContent}
      >
        {loading ? "Generating Report..." : "Generate Report"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
