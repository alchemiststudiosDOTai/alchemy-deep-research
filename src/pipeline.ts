import pLimit from "p-limit";
import { BrowserUseClient } from "./BrowserUseClient";
import {
  generateQueries,
  digest,
  SearchQueryT,
  SearchDigestT,
} from "./llm";
import { firecrawlSearch } from "./firecrawl";

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
    const tasks = queries.map((q) =>
      limit(async () => {
        const fc = await firecrawlSearch(q.query, 2);
        console.log(`FIRECRAWL for query "${q.query}":`, fc);
        if (!fc.length) return { learnings: [], visited: [] };

        const dig = await digest(
          q.query,
          fc.map((f) => f.markdown),
          opts.openaiModel || "gpt-4o-mini"
        );
        console.log(`DIGEST for query "${q.query}":`, dig);

        // browser-enhance every URL once
        const brMarkdown = await Promise.all(
          fc.map(async (f) => {
            try {
              console.log(`[BROWSER] Starting extraction for URL: ${f.url}`);
              const result = await browser.renderAndExtract(f.url, opts.browserModel || "gemini-2.0-flash-lite");
              if (result) {
                console.log(`[BROWSER] Extraction result for URL ${f.url}:`, typeof result === 'string' ? result.slice(0, 500) : result);
              } else {
                console.warn(`[BROWSER] No extraction result for URL ${f.url}`);
              }
              return result;
            } catch (e) {
              console.error(`[BROWSER] Extraction failed for URL ${f.url}:`, e);
              return "";
            }
          })
        );

        const extraLearnings: string[] = [];
        for (const md of brMarkdown.filter(Boolean) as string[]) {
          const d2 = await digest(`Enhanced ${q.query}`, [md], opts.openaiModel || "gpt-4o-mini");
          console.log(`[BROWSER DIGEST] for "${q.query}":`, d2);
          extraLearnings.push(...d2.learnings);
        }

        return {
          learnings: [...dig.learnings, ...extraLearnings],
          visited: fc.map((f) => f.url),
        };
      })
    );

    const results = await Promise.all(tasks);
    const allL = results.flatMap((r) => r.learnings);
    const allV = results.flatMap((r) => r.visited);

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
