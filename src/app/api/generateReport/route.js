// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
// import path from "path";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const REPORT_FILE_PATH = path.join(process.cwd(), "report-content.json");

// async function analyzeAndSummarize(documentContent, prompt) {
//   console.log("Document Content for Summarization:", documentContent); // Log document content
//   const response = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       {
//         role: "user",
//         content: `${prompt}\n\nDocument Content:\n${documentContent}`,
//       },
//     ],
//     max_tokens: 500,
//   });
//   return response.choices[0].message.content;
// }

// // Named POST export for generateReport endpoint
// export async function POST(req) {
//   try {
//     const { documentContent } = await req.json(); // Read request body
//     const reportId = uuidv4();

//     // Prompts for each report section
//     const prompts = [
//       {
//         title: "Key Patterns and Themes",
//         prompt:
//           "Identify key patterns and themes in the document. Limit to 400 words.",
//       },
//       {
//         title: "Goals",
//         prompt:
//           "Based on the document, break down goals into short-term and long-term.",
//       },
//       {
//         title: "Focus for Next Month",
//         prompt: "What should be my focus for the next month?",
//       },
//       {
//         title: "Habits to Cultivate",
//         prompt: "What habits do I want to cultivate?",
//       },
//       {
//         title: "Habits to Break",
//         prompt: "What habits should I aim to break?",
//       },
//       { title: "True Desires", prompt: "What do I really want?" },
//       {
//         title: "Joyful Activities",
//         prompt: "What lights me up and brings me joy?",
//       },
//       {
//         title: "Hidden Insights",
//         prompt: "What's something I might not know about myself?",
//       },
//       {
//         title: "Summary",
//         prompt: "Provide a key recommendations and findings summary.",
//       },
//     ];

//     const report = { reportId, sections: [] };

//     for (const { title, prompt } of prompts) {
//       const result = await analyzeAndSummarize(documentContent, prompt);
//       report.sections.push({ title, content: result });
//     }

//     // Save the report
//     let reportData = [];
//     if (fs.existsSync(REPORT_FILE_PATH)) {
//       reportData = JSON.parse(fs.readFileSync(REPORT_FILE_PATH, "utf-8"));
//     }
//     reportData.push(report);
//     fs.writeFileSync(REPORT_FILE_PATH, JSON.stringify(reportData, null, 2));

//     return new Response(JSON.stringify({ status: "success", reportId }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error in generateReport:", error);
//     return new Response(
//       JSON.stringify({
//         status: "error",
//         message: error.message || "Report generation failed",
//       }),
//       {
//         status: 500,
//       }
//     );
//   }
// }

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const REPORT_FILE_PATH = path.join(process.cwd(), "report-content.json");

// Simplified generateReport endpoint to initialize a new report
export async function POST(req) {
  try {
    const { documentContent } = await req.json(); // Read request body
    const reportId = uuidv4();

    // Set up the report with a unique ID and an empty sections array
    const report = { reportId, documentContent, sections: [] };

    // Read existing reports
    let reportData = [];
    if (fs.existsSync(REPORT_FILE_PATH)) {
      reportData = JSON.parse(fs.readFileSync(REPORT_FILE_PATH, "utf-8"));
    }
    reportData.push(report);

    // Save the new report structure to report-content.json
    fs.writeFileSync(REPORT_FILE_PATH, JSON.stringify(reportData, null, 2));

    return new Response(JSON.stringify({ status: "success", reportId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generateReport:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Report initialization failed",
      }),
      {
        status: 500,
      }
    );
  }
}
