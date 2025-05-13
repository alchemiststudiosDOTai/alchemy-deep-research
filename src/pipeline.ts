import pLimit from "p-limit";
import { BrowserUseClient } from "./BrowserUseClient.js";
import {
  generateQueries,
  digest,
  SearchQueryT,
  SearchDigestT,
} from "./llm.js";
import { firecrawlSearch } from "./firecrawl.js";
import {
  ensureReportDirs,
  // hashUrl, // No longer needed if filenames are query-based for per-item reports
  writeArtefact,
} from "./persistence.js";
import { sanitizeQueryForFilename } from "./utils.js"; // Import from utils

export interface ResearchResult {
  learnings: string[];
  visited: string[];
}

export interface DeepResearchOptions {
  openaiModel?: string;
  browserModel?: string;
}

export async function deepResearch(
  topic: string,
  breadth: number,
  depth: number,
  concurrency = 4,
  opts: DeepResearchOptions = {}
): Promise<ResearchResult> {
  await ensureReportDirs();
  const limit = pLimit(concurrency);
  const browser = new BrowserUseClient();

  async function recurse(
    t: string,
    b: number,
    d: number,
    learnings: string[] = [],
    visited: string[] = []
  ): Promise<ResearchResult> {
    if (d === 0) return { learnings, visited };

    const queries = await generateQueries(t, learnings, b, opts.openaiModel || "gpt-4o-mini");
    console.log('QUERIES:', queries);
    const tasks = queries.map((q: SearchQueryT) =>
      limit(async () => {
        const fc = await firecrawlSearch(q.query, 2);
        console.log(`FIRECRAWL for query "${q.query}":`, fc);

        // Raw markdown from firecrawl (f.markdown) is no longer saved per new requirements.
        // Raw browser extraction result (result from browser.renderAndExtract) is no longer saved directly.
        // We only save LLM outputs.

        if (!fc.length) return { learnings: [], visited: [] };

        const dig = await digest(
          q.query,
          fc.map((f: { markdown: string; url: string }) => f.markdown),
          opts.openaiModel || "gpt-4o-mini"
        );
        console.log(`DIGEST for query "${q.query}":`, dig);

        // Save LLM output for the main query to report/raw/
        const sanitizedQuery = sanitizeQueryForFilename(q.query);
        if (dig.learnings.length > 0) {
          await writeArtefact(
            `report/raw/${sanitizedQuery}.md`,
            dig.learnings.join("\n\n"),
            `LLM learnings for query: ${q.query}`
          );
        }
        await writeArtefact(
          `report/raw/${sanitizedQuery}.json`,
          dig, // Save the full SearchDigestT object
          `LLM JSON for query: ${q.query}`
        );

        // browser-enhance every URL once
        const brMarkdown = await Promise.all(
          fc.map(async (f: { markdown: string; url: string }) => {
            try {
              console.log(`[BROWSER] Starting extraction for URL: ${f.url}`);
              const result = await browser.renderAndExtract(f.url, opts.browserModel || "gpt-4.1-mini");
              // Do NOT save raw 'result' here. We will save the LLM output ('d2') later.
              if (result) {
                console.log(`[BROWSER] Extraction result for URL ${f.url}:`, typeof result === 'string' ? result.slice(0, 500) : result);
                return result;
              } else {
                const failMsg = `[Extraction failed for URL: ${f.url}]`;
                console.warn(`[BROWSER] No extraction result for URL ${f.url}. Adding failure note to findings.`);
                return failMsg;
              }
            } catch (e) {
              const failMsg = `[Extraction failed for URL: ${f.url}]`;
              console.error(`[BROWSER] Extraction failed for URL ${f.url}:`, e, "Adding failure note to findings.");
              return failMsg;
            }
          })
        );

        const extraLearnings: string[] = [];
        for (let i = 0; i < brMarkdown.length; i++) {
          const mdContent = brMarkdown[i]; // Renamed 'md' to 'mdContent' to avoid conflict
          if (!mdContent || typeof mdContent !== 'string') continue; // Ensure it's a string and not empty

          const f = fc[i]; // Original firecrawl item for context (e.g. URL)
          const d2 = await digest(`Enhanced content for ${f.url} (from query: ${q.query})`, [mdContent], opts.openaiModel || "gpt-4o-mini");
          console.log(`[BROWSER DIGEST] for "${f.url}":`, d2);
          extraLearnings.push(...d2.learnings);

          // Save LLM output for the enhanced content to report/raw/
          // Use query and an index/url part for filename to distinguish
          const baseSanitizedQuery = sanitizeQueryForFilename(q.query);
          // Create a unique part for the enhanced file, e.g. from URL or index
          const urlPart = sanitizeQueryForFilename(f.url.split('/').pop() || `item_${i + 1}`);
          const enhancedFileBase = `${baseSanitizedQuery}_enhanced_${urlPart}`;

          if (d2.learnings.length > 0) {
            await writeArtefact(
              `report/raw/${enhancedFileBase}.md`,
              d2.learnings.join("\n\n"),
              `LLM learnings for enhanced content: ${f.url}`
            );
          }
          await writeArtefact(
            `report/raw/${enhancedFileBase}.json`,
            d2, // Save the full SearchDigestT object
            `LLM JSON for enhanced content: ${f.url}`
          );
        }

        return {
          learnings: [...dig.learnings, ...extraLearnings],
          visited: fc.map((f: { markdown: string; url: string }) => f.url),
        };
      })
    );

    const results = await Promise.all(tasks);
    const allL = results.flatMap((r: ResearchResult) => r.learnings);
    const allV = results.flatMap((r: ResearchResult) => r.visited);

    return recurse(
      learnings.slice(0).concat(allL).join("\n"),
      Math.ceil(b / 2),
      d - 1,
      [...learnings, ...allL],
      [...visited, ...allV]
    );
  }

  return recurse(topic, breadth, depth);
}
