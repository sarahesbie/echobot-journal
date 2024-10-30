"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentProcessor() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState(null); // To store generated reportId
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUploadAndStartReport = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setMessage("Uploading and setting up report...");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload document and generate embeddings
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed. Please try again.");
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData);

      if (uploadData.status === "success") {
        setMessage("File uploaded successfully. Initializing report...");

        // Initialize report after successful upload
        const reportResponse = await fetch("/api/generateReport", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentContent: uploadData.content }),
        });

        if (!reportResponse.ok) {
          throw new Error("Error initializing report. Please try again.");
        }

        const reportData = await reportResponse.json();
        if (reportData.status === "success") {
          setReportId(reportData.reportId);
          setMessage(
            "Report initialized! Use the buttons below to add sections."
          );
        } else {
          throw new Error(
            reportData.message || "Unknown error during report initialization."
          );
        }
      } else {
        throw new Error(
          uploadData.message || "Unknown error during file upload."
        );
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError(err.message || "An error occurred during processing.");
    } finally {
      setLoading(false);
    }
  };

  // Individual prompt handling
  const handleGenerateSection = async (title, prompt) => {
    if (!reportId) {
      setError("Initialize the report first.");
      return;
    }

    setLoading(true);
    setMessage(`Generating section: ${title}...`);

    try {
      const response = await fetch(`/api/generateSection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, title, prompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate section: ${title}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setMessage(`Section "${title}" added successfully.`);
      } else {
        throw new Error(data.message || "Error adding section.");
      }
    } catch (err) {
      console.error(`Error generating section "${title}":`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>Upload and Process Document</h2>
      <form
        onSubmit={handleUploadAndStartReport}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Choose a document to analyze:
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "0.5rem" }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          {loading ? "Processing..." : "Upload and Start Report"}
        </button>
      </form>

      {/* Conditional Section Generation Buttons */}
      {reportId && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Add Sections to Report:</h3>
          <button
            onClick={() =>
              handleGenerateSection(
                "Key Patterns and Themes",
                "Identify key patterns and themes in the document."
              )
            }
          >
            Key Patterns and Themes
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Goals",
                "Based on the document, break down goals into short-term and long-term."
              )
            }
          >
            Goals
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Habits to Cultivate",
                "What are habits that I deem as good habits that I would like to cultivate, and at what frequency?"
              )
            }
          >
            Good Habits
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Habits to Break",
                "What are habits that I'm not happy with, that I deem as bad habits, that I aim to break?"
              )
            }
          >
            Bad Habits
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Joyful Activities",
                "What lights me up and brings me joy?"
              )
            }
          >
            Joy
          </button>
          <button
            onClick={() =>
              handleGenerateSection("True Desires", "What do I really want?")
            }
          >
            True Desires
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Hidden Insights",
                "What's something I might not know about myself?"
              )
            }
          >
            Insights
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Focus for Next Month",
                "What should be my focus for the next month?"
              )
            }
          >
            Focus for Next Month
          </button>
          <button
            onClick={() =>
              handleGenerateSection(
                "Summary",
                "Provide a key recommendations and findings summary."
              )
            }
          >
            Summary{" "}
          </button>
        </div>
      )}

      {message && (
        <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
