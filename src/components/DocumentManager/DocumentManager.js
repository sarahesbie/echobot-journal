"use client";
import { useState } from "react";
import DocumentUpload from "@/components/DocumentUpload/DocumentUpload";
import GenerateReport from "../GenerateReport/GenerateReport";

export default function DocumentManager() {
  const [documentContent, setDocumentContent] = useState(null);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>Document Management</h2>
      <DocumentUpload onContentProcessed={setDocumentContent} />
      <GenerateReport documentContent={documentContent} />
    </div>
  );
}
