import fs from 'fs';
import path from 'path';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  // Read the markdown file
  const filePath = path.join(process.cwd(), 'data', 'document.txt');
  const fileContents = fs.readFileSync(filePath, 'utf-8');

  // Remove markdown syntax to get plain text (optional)
  const plainTextContent = fileContents.replace(/[#*_>~`]/g, '');

  // Split the text into chunks
  const chunkSize = 1000; // Adjust as needed
  const chunks = [];
  for (let i = 0; i < plainTextContent.length; i += chunkSize) {
    chunks.push(plainTextContent.slice(i, i + chunkSize));
  }

  console.log("Chunks:", chunks);


  return (
    <div>
      <h1>Chatbot Interface</h1>
      <ChatInterface chunks={chunks} />
    </div>
  );
}
