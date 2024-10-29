import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure API key is set in .env.local
});

// Generate embedding for the prompt
async function generateEmbedding(prompt) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: prompt,
  });
  return response.data[0].embedding;
}
async function summarizeResults(results, prompt) {
  const isIntrospective =
    prompt.toLowerCase().includes("might not know") ||
    prompt.toLowerCase().includes("reflect") ||
    prompt.toLowerCase().includes("hidden") ||
    prompt.toLowerCase().includes("unspoken");

  const summaryPrompt = isIntrospective
    ? `
		  Based on the following journal excerpts, interpret and provide reflective insights that answer the question: "${prompt}".
		  Look for recurring themes, unspoken patterns, emotional tones, or attitudes that might reveal something deeper.
		  
		  Journal Excerpts:
		  ${results.join("\n\n")}`
    : `
		  Based on the following journal excerpts, answer the question: "${prompt}".
		  Summarize the relevant points using:
		  - Headings and subheadings where appropriate
		  - Bullet points for key points
		  - Concise and relevant details
		  
		  Journal Excerpts:
		  ${results.join("\n\n")}`;

  // Log the generated prompt for OpenAI
  console.log("Summarization prompt:", summaryPrompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful and insightful assistant.",
        },
        { role: "user", content: summaryPrompt },
      ],
      max_tokens: 600,
    });

    // Log the response received from OpenAI
    console.log("OpenAI response:", response);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in summarizeResults OpenAI API call:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Generate embedding from the user prompt
    const embedding = await generateEmbedding(prompt);

    // Send the embedding to the FAISS server to search for similar text
    const faissResponse = await fetch(
      "http://127.0.0.1:5000/search_embeddings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ embedding }),
      }
    );

    const faissData = await faissResponse.json();

    if (faissData.status === "success") {
      const searchResults = faissData.results;
      console.log("FAISS search results:", searchResults);

      // Summarize and structure results with OpenAI
      const structuredSummary = await summarizeResults(searchResults, prompt);

      return new Response(
        JSON.stringify({
          status: "success",
          summary: structuredSummary,
        }),
        { status: 200 }
      );
    } else {
      console.error("FAISS server error:", faissData.message);
      return new Response(
        JSON.stringify({ status: "error", message: faissData.message }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/search:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Search failed" }),
      { status: 500 }
    );
  }
}
