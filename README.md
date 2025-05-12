<p align="center">
  <img src="./logo.png" alt="Alchemy Deep Research Logo" width="300"/>
</p>

# Alchemy Deep Research

A modern, extensible research automation tool that leverages LLMs, web search, and browser-based extraction to generate actionable, professional reports from the web.

## 🚀 Features
- **Automated Research Pipeline**: Generates focused queries, scrapes the web, summarizes findings, and recursively explores follow-up questions.
- **Prompt-Driven Extraction**: Uses an editable prompt file (`prompts/browser-use.md`) for browser-based content extraction—customize instructions without code changes.
- **Multi-Model Support**: Choose your preferred OpenAI and BrowserUse LLM models at runtime.
- **Flexible CLI**: Control depth, breadth, concurrency, and models from the command line.
- **Professional Reports**: Automatically generates a clean, markdown-formatted `REPORT.md` with findings and references after each run.
- **Environment-First**: All API keys are loaded from `.env` for security and flexibility.

---

## 🛠️ Quick Start

1. **Clone the repo & install dependencies**
   ```sh
   git clone <your-repo-url>
   cd alchemy-deep-research
   npm i alchemy-deep-research
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
   ```sh
   npx ts-node run-research.ts \
     --query "How do LLMs handle long-term memory?" \
     --openai-model "gpt-4o-mini" \
     --browser-model "gemini-2.0-flash-lite" \
     --depth 1 \
     --breadth 1 \
     --concurrency 1
   ```
   - All research and reporting will use the specified OpenAI model for consistency.

---

## 📄 Output
- **REPORT.md**: After every run, a professional markdown report is generated, summarizing all findings and listing all source URLs.
- **Console Output**: Key logs, extraction steps, and the final report are printed to the terminal.

---

## ⚙️ CLI Options
| Option            | Description                                         | Default           |
|-------------------|-----------------------------------------------------|-------------------|
| `--query`         | Main research question or topic                     | (required)        |
| `--openai-model`  | OpenAI model for LLM and report (e.g. gpt-4o-mini)  | gpt-4o-mini       |
| `--browser-model` | BrowserUse model for extraction                     | gemini-2.0-flash-lite |
| `--depth`         | Recursion depth (levels of follow-up)               | 1                 |
| `--breadth`       | Breadth (queries per level)                         | 1                 |
| `--concurrency`   | Number of queries to process in parallel            | 1                 |
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

## CLI Usage

You can customize your research run with the following options:

### Save as JSON

Add the `--json` flag to also save the research results and the markdown report to `REPORT.json`:

```bash
npx ts-node run-research.ts \
  --query "How do LLMs handle long-term memory?" \
  --openai-model "gpt-4o-mini" \
  --browser-model "gemini-2.0-flash-lite" \
  --depth 1 \
  --breadth 1 \
  --concurrency 1 \
  --json
```

This will produce both `REPORT.md` and `REPORT.json` in your working directory.


```sh
npx ts-node run-research.ts \
  --query "How do LLMs<p align="center">
  <img src="./logo.png" alt="alchemy deep research logo" width="300"/>
</p>

> **Note:** This is an early-stage project. Expect rapid changes! I will be building out more agentic flows and advanced features to enable even better, deeper research in the near future. Feedback and contributions are welcome.


## 📦 Installation

Install from npm (recommended):

[![npm version](https://img.shields.io/npm/v/alchemy-deep-research?style=flat-square)](https://www.npmjs.com/package/alchemy-deep-research)

```bash
npm install alchemy-deep-research
```

[View on npm](https://www.npmjs.com/package/alchemy-deep-research)

---

# REPORT: Long-Term Memory in Large Language Models (LLMs)" \
  --openai-model "gpt-4o" \
  --browser-model "gemini-2.0-flash-lite" \
  --depth 2 \
  --breadth 3 \
  --concurrency 4
```

### CLI Options
| Option            | Description                                                         | Default                     |
|-------------------|---------------------------------------------------------------------|-----------------------------|
| `--query`         | Main research question or topic                                     | "How do LLMs handle long-term memory?" |
| `--openai-model`  | OpenAI model for LLM (query/digest) tasks                           | gpt-4o-mini                 |
| `--browser-model` | LLM model for BrowserUse API extraction                            | gemini-2.0-flash-lite       |
| `--depth`         | Recursion depth (how many levels of follow-up research)             | 2                           |
| `--breadth`       | Breadth (number of queries per level)                               | 3                           |
| `--concurrency`   | How many queries to process in parallel                             | 4                           |

---

## Output
- **LEARNINGS:** Top 2 concise insights from the research process.
- **SOURCES:** Top 2 URLs visited as sources.

---

## Environment Variables
- `OPENAI_API_KEY` – Your OpenAI API key (required)
- `FIRECRAWL_KEY` – Your Firecrawl API key (required)
- `BROWSER_USE_API_KEY` – Your BrowserUse API key (required)

---

## Customization
- You can add new models, change the number of learnings returned, or extend the pipeline logic in `src/pipeline.ts` and `src/llm.ts`.
- The CLI (`run-research.ts`) is easily extensible for more options (output format, max learnings, etc).

---

## Troubleshooting
- **API Rate Limits:** The pipeline has built-in retry logic for Firecrawl and logs detailed errors for browser extraction.
- **Empty Results:** Try adjusting your query, increasing breadth/depth, or using a different model.

---

## License
MIT

---

## Acknowledgments
- Built with OpenAI, Firecrawl, and BrowserUse APIs.
- Inspired by the need for fast, deep, and actionable research.
