// examples/programmatic_usage.ts
//
// This is an example of how to use the 'alchemy-deep-research' package
// programmatically after installing it in your own project.
//
// To run this example in your own project:
// 1. Create a new project:
//    mkdir my-research-project
//    cd my-research-project
//    npm init -y
// 2. Install alchemy-deep-research:
//    npm install alchemy-deep-research
// 3. Install dotenv (for managing API keys):
//    npm install dotenv
// 4. Create a '.env' file in your project root (e.g., my-research-project/.env)
//    with your API keys:
//    OPENAI_API_KEY=your_openai_api_key
//    BROWSER_USE_API_KEY=your_browser_use_api_key
//    FIRECRAWL_API_KEY=your_firecrawl_api_key (if Firecrawl requires it)
// 5. Save this script as 'run_my_research.ts' (or similar) in your project.
// 6. Compile and run, or use ts-node:
//    npx ts-node run_my_research.ts

import {
  deepResearch,
  DeepResearchOptions,
  ResearchResult,
  generateReport,
  sanitizeQueryForFilename
} from 'alchemy-deep-research'; // Standard import for an installed package
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

// Load environment variables from .env file in the current project
dotenv.config();

async function performResearchAndSaveReport() {
  console.log("Starting programmatic research...");

  // Check for necessary API keys
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not set in your .env file or environment.");
    return;
  }
  if (!process.env.BROWSER_USE_API_KEY) {
    console.error("Error: BROWSER_USE_API_KEY is not set in your .env file or environment.");
    return;
  }
  // Add check for FIRECRAWL_API_KEY if deepResearch strictly requires it via FirecrawlApp
  if (!process.env.FIRECRAWL_API_KEY) {
    console.warn("Warning: FIRECRAWL_API_KEY is not set. Firecrawl functionality might be limited or fail.");
  }


  const topic = "The Impact of AI on Modern Software Development";
  const breadth = 1;
  const depth = 1;
  const concurrency = 1;

  const options: DeepResearchOptions = {
    openaiModel: "gpt-4o-mini",
    browserModel: "gpt-4.1-mini"
  };

  try {
    const researchResult: ResearchResult = await deepResearch(
      topic,
      breadth,
      depth,
      concurrency,
      options
    );

    console.log("\n--- Research Learnings ---");
    researchResult.learnings.forEach((learning, index) => {
      console.log(`${index + 1}: ${learning}`);
    });

    console.log("\n--- Visited URLs ---");
    researchResult.visited.forEach((url, index) => {
      console.log(`${index + 1}: ${url}`);
    });

    const summaryReportMarkdown = await generateReport(
      topic,
      researchResult.learnings,
      researchResult.visited,
      options.openaiModel
    );

    console.log("\n--- Generated Summary Report (Markdown Preview) ---");
    console.log(summaryReportMarkdown.substring(0, 500) + "...");

    const sanitizedQuery = sanitizeQueryForFilename(topic);
    const reportFilename = `${sanitizedQuery}_report.md`; // Saved in the current directory

    await fs.writeFile(reportFilename, summaryReportMarkdown);
    console.log(`\nSummary report saved to ./${reportFilename}`);

    // Note: deepResearch also saves individual LLM outputs to './report/raw/'

  } catch (error) {
    console.error("\nAn error occurred during the research process:", error);
  }
}

performResearchAndSaveReport();