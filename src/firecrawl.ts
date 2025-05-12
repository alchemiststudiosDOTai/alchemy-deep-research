import FirecrawlApp from "@mendable/firecrawl-js";

const client = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_KEY!,
});

export async function firecrawlSearch(query: string, k = 2, maxRetries = 5): Promise<{ markdown: string; url: string }[]> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await client.search(query, { limit: k, scrapeOptions: { formats: ["markdown", "links"] } });
      return res.data
        .filter((d: any) => d.markdown && d.url)
        .map((d: any) => ({
          markdown: d.markdown.slice(0, 25000),
          url: d.url,
        }));
    } catch (err: any) {
      // Firecrawl rate limit error
      if (err.statusCode === 429 || (err.message && err.message.includes('rate limit'))) {
        const wait = 30_000; // wait 30 seconds before retry
        console.warn(`Firecrawl rate limit hit. Waiting ${wait / 1000}s before retrying (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, wait));
        attempt++;
        continue;
      }
      throw err;
    }
  }
  throw new Error('Firecrawl: exceeded max retries due to rate limiting.');
}
