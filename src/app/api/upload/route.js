import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Ensure the server runtime for serverless platforms
export const runtime = "nodejs";

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to split text into chunks
function splitIntoChunks(text, chunkSize = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  console.log(`Total chunks created: ${chunks.length}`);
  return chunks;
}

// Function to read and chunk file contents
async function readAndChunkFile(filePath) {
  try {
    console.log("Reading file and splitting into chunks...");
    const fileContents = await fs.promises.readFile(filePath, "utf-8");
    return splitIntoChunks(fileContents);
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("File read failed");
  }
}

// Function to generate embeddings for each chunk
async function generateEmbeddings(chunks) {
  console.log("Starting embedding generation for chunks...");
  const embeddings = [];
  for (const [index, chunk] of chunks.entries()) {
    try {
      console.log(
        `Generating embedding for chunk ${index + 1} of ${chunks.length}`
      );
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });
      const embedding = response.data[0].embedding;
      embeddings.push(embedding);
      console.log(`Embedding generated for chunk ${index + 1}`);
    } catch (error) {
      console.error(
        `Error generating embedding for chunk ${index + 1}:`,
        error
      );
      throw new Error(`Embedding generation failed at chunk ${index + 1}`);
    }
  }
  console.log(
    `All embeddings generated successfully. Total embeddings: ${embeddings.length}`
  );
  return embeddings;
}

// Function to send embeddings to the FAISS server
async function sendEmbeddingsToFaiss(embeddings, chunks) {
  console.log("Sending embeddings to FAISS server...");
  try {
    const response = await fetch("http://127.0.0.1:5000/add_embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeddings, chunks }),
    });
    const result = await response.json();
    console.log("FAISS server response:", result);
    return result;
  } catch (error) {
    console.error("Error sending embeddings to FAISS server:", error);
    throw new Error("FAISS server request failed");
  }
}

export async function POST(req) {
  try {
    // Parse form data and file
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      console.error("File not provided in form data");
      return new Response(
        JSON.stringify({ status: "error", message: "File not provided" }),
        { status: 400 }
      );
    }

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Save the file locally
    const filePath = path.join(uploadDir, file.name);
    const fileContents = await file.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(fileContents));
    console.log(`File saved at ${filePath}`);

    // Read and chunk the file
    const chunks = await readAndChunkFile(filePath);
    console.log("Chunks prepared:", chunks);

    // Generate embeddings for each chunk
    const embeddings = await generateEmbeddings(chunks);
    console.log(
      `Generated ${embeddings.length} embeddings for ${chunks.length} chunks`
    );

    // Send embeddings and chunks to the FAISS server
    const faissResponse = await sendEmbeddingsToFaiss(embeddings, chunks);
    console.log("FAISS response:", faissResponse);

    if (faissResponse.status === "success") {
      return new Response(
        JSON.stringify({
          status: "success",
          message: "File processed, chunked, and embeddings stored in FAISS",
          content: chunks.join(" "), // Example, may need to adjust based on use case
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.error("FAISS server returned an error:", faissResponse.message);
      return new Response(
        JSON.stringify({
          status: "error",
          message: faissResponse.message || "Embedding storage failed",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during file processing:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message:
          error.message || "File processing and embedding generation failed",
      }),
      { status: 500 }
    );
  }
}
