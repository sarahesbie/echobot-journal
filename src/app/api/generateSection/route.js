import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REPORT_FILE_PATH = path.join(process.cwd(), "report-content.json");

async function analyzeAndSummarize(documentContent, prompt) {
  console.log("Document Content for Summarization:", documentContent); // Log document content

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `${prompt}\n\nDocument Content:\n${documentContent}`,
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content;
}

export async function POST(req) {
  try {
    const { reportId, title, prompt } = await req.json();

    // Load current reports data
    const reportData = JSON.parse(fs.readFileSync(REPORT_FILE_PATH, "utf-8"));
    const report = reportData.find((r) => r.reportId === reportId);
    if (!report) throw new Error("Report not found");

    // Generate content for the section
    const content = await analyzeAndSummarize(report.documentContent, prompt);
    report.sections.push({ title, content });

    // Save updated report
    fs.writeFileSync(REPORT_FILE_PATH, JSON.stringify(reportData, null, 2));

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating section:", error);
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      {
        status: 500,
      }
    );
  }
}
