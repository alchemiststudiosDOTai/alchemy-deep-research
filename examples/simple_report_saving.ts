// examples/simple_report_saving.ts
// This example shows how to generate a report string and save it to a file
// after installing 'alchemy-deep-research'.

// Assume 'alchemy-deep-research' is installed in your project:
// npm install alchemy-deep-research

import { generateReport, sanitizeQueryForFilename } from 'alchemy-deep-research';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

// For generateReport to work, it typically needs results from deepResearch.
// deepResearch itself requires API keys. For this isolated example,
// we'll use mock data for learnings and visited URLs.
// In a real scenario, you'd get these from `await deepResearch(...)`.
// Ensure OPENAI_API_KEY is set in your environment or .env for generateReport.
dotenv.config(); // Loads .env file from the current directory (or project root)

async function createAndSaveReport() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not set. `generateReport` requires it.");
    console.error("Please set it in your environment or a .env file.");
    return;
  }

  const topic = "Example Research Topic";
  // Mock data that would typically come from deepResearch()
  const mockLearnings: string[] = [
    "This is the first key learning point.",
    "This is another important finding.",
    "A third insight gathered from research."
  ];
  const mockVisitedUrls: string[] = [
    "https://example.com/source1",
    "https://example.com/source2"
  ];
  const openAIModelForReport = "gpt-4o-mini"; // Or your preferred model

  console.log(`Generating report for topic: "${topic}"...`);

  try {
    // Generate the report markdown string
    const reportMarkdown = await generateReport(
      topic,
      mockLearnings,
      mockVisitedUrls,
      openAIModelForReport
    );

    console.log("\n--- Generated Report Markdown (Preview) ---");
    console.log(reportMarkdown.substring(0, 300) + "..."); // Print a preview

    // Sanitize the topic for a safe filename and save the report
    const sanitizedTopic = sanitizeQueryForFilename(topic);
    const filename = `${sanitizedTopic}_report.md`;

    await fs.writeFile(filename, reportMarkdown);
    console.log(`\nReport successfully saved to ./${filename}`);

  } catch (error) {
    console.error("\nAn error occurred while generating or saving the report:", error);
  }
}

createAndSaveReport();

/*
To run this example:
1. Make sure you have 'alchemy-deep-research' installed in your project:
   npm install alchemy-deep-research
   (Or, if running from within the alchemy-deep-research repo for testing,
    ensure it's built and adjust import paths if necessary).
2. Ensure you have an OPENAI_API_KEY set in your environment or a .env file
   in the directory where you run this script.
3. Compile and run this TypeScript file, or run with ts-node:
   - If you have ts-node:
     ts-node examples/simple_report_saving.ts
   - Or compile first:
     tsc examples/simple_report_saving.ts --outDir ./temp_examples --module nodenext --target es2020 --esModuleInterop --skipLibCheck --resolveJsonModule
     node ./temp_examples/simple_report_saving.js
     (Clean up temp_examples afterwards)
*/