<p align="center">
  <img src="./logo.png" alt="Alchemy Deep Research Logo" width="300"/>
</p>

# Alchemy Deep Research

A modern, extensible research automation tool that leverages LLMs, web search, and browser-based extraction to generate actionable, professional reports from the web.

## 🚀 Features
- **Automated Research Pipeline**: Generates focused queries, scrapes the web, summarizes findings, and recursively explores follow-up questions.
- **Prompt-Driven Extraction**: Uses an editable prompt file (`prompts/browser-use.md`) for browser-based content extraction—customize instructions without code changes.
- **Multi-Model Support**: Choose your preferred OpenAI and BrowserUse LLM models at runtime.
- **Headless Browser Search**: Optionally gather pages using a Puppeteer-based search agent.
- **Flexible CLI**: Control depth, breadth, concurrency, and models from the command line.
- **Professional Reports**: Automatically generates a clean, markdown-formatted `REPORT.md` with findings and references after each run.
- **Environment-First**: All API keys are loaded from `.env` for security and flexibility.

---

## 🛠️ Quick Start

1. **Installation**
   For end-users, install from npm:
   ```sh
   npm install alchemy-deep-research
   ```
   For development (to run from source or contribute):
   ```sh
   git clone https://github.com/your-username/alchemy-deep-research.git # Replace with your repo URL
   cd alchemy-deep-research
   npm install # or npm ci
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-key
   FIRECRAWL_KEY=your-firecrawl-key
   BROWSER_USE_API_KEY=your-browser-use-key
   ```

3. **Edit the browser extraction prompt (optional)**
   - Customize `prompts/browser-use.md` to change how web content is extracted and summarized.

4. **Run a research query**
   After installing the package locally in your project (`npm install alchemy-deep-research`):
   ```sh
  npx alchemy-deep-research \
    --query "How do LLMs handle long-term memory?" \
    --openai-model "gpt-4o-mini" \
    --browser-model "gpt-4.1-mini" \
    --headless-search
  ```
   If you installed the package globally (`npm install -g alchemy-deep-research`), you can omit `npx`:
   ```sh
   alchemy-deep-research --query "Your query here"
   ```
   
   To run from source (after cloning and `npm install` in the package directory):
   ```sh
   npx ts-node src/cli.ts --query "Your query here"
   # or npm run build && node dist/cli.js --query "Your query here"
   ```

---

## 📄 Output Structure

The tool generates reports in a structured `report/` directory:

- **`report/raw/`**: Contains detailed LLM outputs for each research query and each piece of browser-enhanced content.
  - Files are named based on the sanitized query, e.g., `[sanitized_query].md` (learnings) and `[sanitized_query].json` (full digest).
  - Enhanced content outputs are named like `[sanitized_query]_enhanced_[identifier].md/.json`.
- **`report/cleaned_report/`**: Contains the final, consolidated summary report.
  - Named `[sanitized_query]_summary_report.md`.
  - If the `--json` flag is used, `[sanitized_query]_summary_report.json` is also created here.
- **Console Output**: Key logs, extraction steps, and the final summary report are also printed to the terminal.

---

## ⚙️ CLI Options
| Option            | Description                                         | Default           |
|-------------------|-----------------------------------------------------|---------------------------------------|
| `--query`         | Main research question or topic                     | "How do LLMs handle long-term memory?" |
| `--openai-model`  | OpenAI model for LLM and report (e.g. gpt-4o-mini)  | gpt-4o-mini                           |
| `--browser-model` | BrowserUse model for extraction                     | gpt-4.1-mini                     |
| `--depth`         | Recursion depth (levels of follow-up)               | 1                 |
| `--breadth`       | Breadth (queries per level)                         | 1                 |
| `--concurrency`   | Number of queries to process in parallel            | 1                 |
| `--headless-search` | Use a Puppeteer-based search agent                 | false          |
| `--json`         | Also save the research results and report as JSON   | false             |

---

## 🧩 Customization
- **Prompt Engineering**: Edit `prompts/browser-use.md` to control how browser-based extraction works.
- **Pipeline Logic**: Extend or modify the pipeline in `src/pipeline.ts`.
- **Report Formatting**: Tweak `src/report.ts` for advanced report customization.

---

## 🛡️ Troubleshooting
- **API Rate Limits**: The pipeline logs rate limit errors and retries automatically.
- **Empty Results**: Try adjusting your query, increasing breadth/depth, or using a different model.
- **Missing Keys**: Ensure your `.env` file is correctly formatted (no quotes around values).

---

## 📜 License
MIT

---

## 🙏 Acknowledgments
- Built with OpenAI, Firecrawl, and BrowserUse APIs.
- Inspired by the need for fast, deep, and actionable research.


---

## Advanced CLI Usage

You can customize your research run with the following options:

### JSON Output

Add the `--json` flag to also save the research results and the markdown report to `REPORT.json`:

```bash
alchemy-deep-research \
  --query "How do LLMs handle long-term memory?" \
  --openai-model "gpt-4o-mini" \
  --browser-model "gpt-4.1-mini" \
  --json
```

This will produce `how_do_llms_handle_long_term_memory_summary_report.md` and `how_do_llms_handle_long_term_memory_summary_report.json` in the `report/cleaned_report/` directory.


```sh
alchemy-deep-research \
  --query "Latest advancements in AI ethics" \
  --openai-model "gpt-4o" \
  --browser-model "gpt-4.1-mini" \
  --depth 2 \
  --breadth 3 \
  --concurrency 4 \
  --json
```

### Sample Report Output

When you run the tool, it generates a comprehensive markdown report like this example (from a query about LLMs and long-term memory):

```markdown
# REPORT: How Do LLMs Handle Long-Term Memory?

## Introduction
Large Language Models (LLMs) have transformed the landscape of artificial intelligence and natural language processing. One of the critical areas of research is how these models can effectively manage long-term memory. This report summarizes recent findings on the mechanisms, challenges, and architectural considerations involved in enhancing LLMs' long-term memory capabilities.

## Key Findings

### 1. Memory Components
- **Enhancing Memory Retention**: LLMs can significantly improve long-term memory retention and retrieval by incorporating additional memory components. This includes:
  - **Database Storage**: External databases that allow for the storage of relevant information over extended periods.
  - **Internal Memory Modules**: Built-in memory systems that help retain context and information.

### 2. Architectural Design Considerations
- **Storage Capacity**: Effective storage solutions are crucial for maintaining large amounts of information.
- **Memory Update Mechanisms**: Systems must be in place to update stored information, ensuring it remains relevant.
- **Integration with Attention Mechanisms**: Attention mechanisms help ensure that responses are contextual and relevant, enhancing the user experience.

## References
1. Yulleyi. (2023). *Large Language Models (LLM) with Long-Term Memory: Advancements and Opportunities in GenAI*
2. Arxiv. (2023). *Long-Term Memory in Language Models*
```

## 📦 Using as a Library (Programmatic Usage)

You can also use `alchemy-deep-research` as a library in your own TypeScript/JavaScript projects.

1. **Install the package:**
   ```bash
   npm install alchemy-deep-research
   ```

2. **Import and use in your code:**
   ```typescript
   import {
     deepResearch,
     generateReport,
     DeepResearchOptions,
     ResearchResult
   } from 'alchemy-deep-research';
   import * as dotenv from 'dotenv';

   dotenv.config(); // Ensure your API keys are loaded from .env

   async function run() {
     const topic = "Future of renewable energy storage";
     const options: DeepResearchOptions = { openaiModel: "gpt-4o-mini" };
     const result: ResearchResult = await deepResearch(topic, 1, 1, 1, options);
     
     console.log("Learnings:", result.learnings);

     const reportMd = await generateReport(topic, result.learnings, result.visited, options.openaiModel);
     console.log("\nReport:\n", reportMd);
     // You can save reportMd to a file using fs.writeFile
   }

   run();
   ```

For a more detailed example, see [`examples/programmatic_usage.ts`](./examples/programmatic_usage.ts).

### ESM Package
Please note that `alchemy-deep-research` is an ES Module package (`"type": "module"`). Ensure your project is configured to work with ESM packages if you're importing it.

---

## 📜 License
MIT

---

## 🙏 Acknowledgments
- Built with OpenAI, Firecrawl, and BrowserUse APIs.
- Inspired by the need for fast, deep, and actionable research.


---

> **Note:** This is an early-stage project. Expect rapid changes! I will be building out more agentic flows and advanced features to enable even better, deeper research in the near future.
