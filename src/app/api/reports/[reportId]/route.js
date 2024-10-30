import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  const { reportId } = params;
  const REPORT_FILE_PATH = path.join(process.cwd(), "report-content.json");

  try {
    // Read the report content file
    const data = JSON.parse(fs.readFileSync(REPORT_FILE_PATH, "utf-8"));
    const report = data.find((r) => r.reportId === reportId);

    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error reading report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
