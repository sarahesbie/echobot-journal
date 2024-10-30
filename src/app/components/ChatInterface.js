"use client";

import { useState } from 'react';

export default function ChatInterface({ chunks }) {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findRelevantChunks = (query) => {
    const relevant = chunks.filter(chunk => {
      const queryLowerCase = query.toLowerCase();
      const chunkLowerCase = chunk.toLowerCase();
      return chunkLowerCase.includes(queryLowerCase);
    });
  
    // Limit the number of relevant chunks to avoid sending too much data
    return relevant.slice(0, 5); // Adjust the limit as needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);  // Reset error state

    try {
      // Find relevant chunks based on user input
      const relevantChunks = findRelevantChunks(input);
      const context = relevantChunks.join(' ');

      console.log("Message:", input);
      console.log("Context:", context);

      // Send the user's query and context to the back-end API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, context }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update conversation history with user input and GPT-4 response
      setConversation([...conversation, { role: 'user', text: input }, { role: 'GPT', text: data.response }]);
      setInput('');  // Clear the input
    } catch (err) {
      console.error('Error during request:', err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Display conversation */}
      <div>
        {conversation.map((msg, idx) => (
          <p key={idx} className={msg.role === 'user' ? 'user-message' : 'gpt-message'}>
            <strong>{msg.role === 'user' ? 'You' : 'GPT'}: </strong>{msg.text}
          </p>
        ))}
      </div>

      {/* Display error message if there is one */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Submit'}</button>
      </form>

      <style jsx>{`
        .user-message { text-align: right; color: blue; }
        .gpt-message { text-align: left; color: green; }
      `}</style>
    </div>
  );
}
