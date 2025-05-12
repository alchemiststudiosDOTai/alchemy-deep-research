import { deepResearch } from "./src/pipeline";
import { generateReport } from "./src/report";
import * as fs from "fs";
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
    description: "BrowserUse LLM model (e.g. gemini-2.0-flash-lite)",
    default: "gemini-2.0-flash-lite",
  })
  .option("depth", {
    type: "number",
    description: "Recursion depth",
    default: 2,
  })
  .option("breadth", {
    type: "number",
    description: "Breadth (queries per level)",
    default: 3,
  })
  .option("concurrency", {
    type: "number",
    description: "Concurrency",
    default: 4,
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
  fs.writeFileSync("REPORT.md", report);
  console.log("\nREPORT saved to REPORT.md\n");
  console.log(report);
})();
