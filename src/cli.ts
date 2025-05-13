#!/usr/bin/env node
import { deepResearch } from "./pipeline.js";
import { generateReport } from "./report.js";
import * as fs from "fs";
import * as path from "path";
import { sanitizeQueryForFilename } from "./utils.js"; // Import the utility
import * as dotenv from "dotenv";
dotenv.config();
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("query", {
    alias: "q",
    type: "string",
    description: "Main research question or topic",
    default: "How do LLMs handle long-term memory?",
  })
  .option("openai-model", {
    type: "string",
    description: "OpenAI model for LLM (e.g. gpt-4o)",
    default: "gpt-4o-mini",
  })
  .option("browser-model", {
    type: "string",
    description: "BrowserUse LLM model (e.g. gpt-4.1-mini)",
    default: "gpt-4.1-mini",
  })
  .option("depth", {
    type: "number",
    description: "Recursion depth",
    default: 1,
  })
  .option("breadth", {
    type: "number",
    description: "Breadth (queries per level)",
    default: 1,
  })
  .option("concurrency", {
    type: "number",
    description: "Concurrency",
    default: 1,
  })
  .option("json", {
    type: "boolean",
    description: "Also save the research results and report as JSON",
    default: false,
  })
  .help()
  .alias("help", "h")
  .parseSync();

(async () => {
  const res = await deepResearch(
    argv.query,
    argv.breadth,
    argv.depth,
    argv.concurrency,
    {
      openaiModel: argv["openai-model"],
      browserModel: argv["browser-model"],
    }
  );

  // Generate a final report using the same OpenAI model as the research pipeline
  const report = await generateReport(
    argv.query,
    res.learnings,
    res.visited,
    argv["openai-model"]
  );

  const reportDir = "report";
  const cleanedReportDir = path.join(reportDir, "cleaned_report");
  const sanitizedQuery = sanitizeQueryForFilename(argv.query);
  // ensureReportDirs in pipeline.ts should have already created these.

  const finalReportMdPath = path.join(cleanedReportDir, `${sanitizedQuery}_summary_report.md`);
  fs.writeFileSync(finalReportMdPath, report);
  console.log(`\nREPORT saved to ${finalReportMdPath}\n`);
  console.log(report);

  if (argv.json) {
    const jsonOut = {
      query: argv.query,
      openaiModel: argv["openai-model"],
      browserModel: argv["browser-model"],
      depth: argv.depth,
      breadth: argv.breadth,
      concurrency: argv.concurrency,
      learnings: res.learnings,
      visited: res.visited,
      markdownReport: report
    };
    const finalReportJsonPath = path.join(cleanedReportDir, `${sanitizedQuery}_summary_report.json`);
    fs.writeFileSync(finalReportJsonPath, JSON.stringify(jsonOut, null, 2));
    console.log(`REPORT saved to ${finalReportJsonPath}`);
  }
})();