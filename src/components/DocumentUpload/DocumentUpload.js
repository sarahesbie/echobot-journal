"use client";
import { useState } from "react";

export default function DocumentUpload({ onContentProcessed }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.status === "success") {
        setMessage("File uploaded successfully!");
        onContentProcessed(data.content); // Pass content to parent
      } else {
        setMessage("Failed to upload the file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>Upload Your Document</h2>
      <form
        onSubmit={handleSubmit}
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
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Upload Document
        </button>
      </form>
      {message && (
        <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
      )}
    </div>
  );
}
