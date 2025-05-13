// examples/programmatic_usage.ts

// Ensure you have a .env file in the root of this project (or set environment variables)
// with your API keys:
// OPENAI_API_KEY=your_openai_api_key
// BROWSER_USE_API_KEY=your_browser_use_api_key
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Adjust path if running from a different directory

// === How to use this example ===
// 1. If you've installed 'alchemy-deep-research' as a dependency in your own project (e.g., via npm):
//    You would typically import like this:
//    import { deepResearch, DeepResearchOptions, ResearchResult, generateReport } from 'alchemy-deep-research';

// 2. If you are running this example script from *within* the 'alchemy-deep-research' repository
//    (e.g., for testing or development of the package itself):
//    a. Ensure the package is built (run 'npm run build' from the project root).
//    b. The import below points to the local build output.
import {
  deepResearch,
  DeepResearchOptions,
  ResearchResult,
  generateReport,
  sanitizeQueryForFilename // Import the utility
} from '../dist/index.js'; // Points to local build output
import * as fs from 'fs/promises'; // For saving the report

async function main() {
  console.log("Starting programmatic research example...");

  // Check for API keys (basic check)
  if (!process.env.OPENAI_API_KEY || !process.env.BROWSER_USE_API_KEY) {
    console.error("Error: Missing OPENAI_API_KEY or BROWSER_USE_API_KEY in environment variables or .env file.");
    console.error("Please create a .env file in the project root (../.env from this example's perspective)");
    console.error("with OPENAI_API_KEY=your_key and BROWSER_USE_API_KEY=your_key");
    return;
  }

  const topic = "What are the latest advancements in quantum computing?";
  const breadth = 1; // Number of search queries to generate per level
  const depth = 1;   // Recursion depth for the research
  const concurrency = 1; // Number of concurrent operations

  const options: DeepResearchOptions = {
    openaiModel: "gpt-4o-mini", // Or your preferred OpenAI model
    browserModel: "gpt-4.1-mini" // Or your preferred BrowserUse model
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

    // Generate the final summary report
    const summaryReportMarkdown = await generateReport(
      topic,
      researchResult.learnings,
      researchResult.visited,
      options.openaiModel // Use the same model for consistency
    );

    console.log("\n--- Generated Summary Report (Markdown) ---");
    console.log(summaryReportMarkdown);

    // Save the report to a file
    const sanitizedQuery = sanitizeQueryForFilename(topic);
    const reportFilename = `${sanitizedQuery}_programmatic_report.md`;
    try {
      await fs.writeFile(reportFilename, summaryReportMarkdown);
      console.log(`\nSummary report saved to ./${reportFilename}`);
    } catch (writeError) {
      console.error(`\nFailed to save report to ${reportFilename}:`, writeError);
    }

  } catch (error) {
    console.error("\nAn error occurred during the research process:", error);
  }
}

main();

/*
To run this example:
1. Make sure you have a .env file in the root of the 'alchemy-deep-research' project
   (sibling to 'src', 'dist', 'examples') with your API keys:
   OPENAI_API_KEY=your_openai_key
   BROWSER_USE_API_KEY=your_browser_use_key

2. Build the 'alchemy-deep-research' package:
   From the root of the 'alchemy-deep-research' project, run:
   npm run build

3. Run this example script:
   From the root of the 'alchemy-deep-research' project, you can run:
   node dist/examples/programmatic_usage.js
   (Assuming tsc compiles 'examples/' to 'dist/examples/')
   OR, if you have ts-node installed globally or as a dev dependency:
   ts-node examples/programmatic_usage.ts
   (You might need to adjust the import path at the top if using ts-node directly on the .ts file,
    e.g., to point to '../src/index.ts' if ts-node handles module resolution from source)

   If 'examples' is not part of your tsconfig `rootDir` or `include`,
   you might need to compile it separately or adjust tsconfig.
   A simple way if it's not compiled:
   tsc examples/programmatic_usage.ts --outDir dist_examples --module nodenext --target es2020 --esModuleInterop --skipLibCheck
   node dist_examples/programmatic_usage.js
*/