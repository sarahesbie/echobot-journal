"use client";
import { useState } from "react";

export default function SearchComponent() {
  const [prompt, setPrompt] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Initialize as empty array
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError(""); // Clear previous errors
    setSearchResults([]); // Clear previous results

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setSearchResults([data.summary]); // Wrap `summary` in an array for rendering
      } else {
        setError(data.message || "An error occurred during search.");
      }
    } catch (err) {
      console.error("Error during search:", err);
      setError("An error occurred during search.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>Search Your Document</h2>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your question"
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {searchResults.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
