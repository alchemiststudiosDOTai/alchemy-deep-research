import puppeteer from 'puppeteer';

export async function headlessSearch(query: string, k = 2): Promise<{ markdown: string; url: string }[]> {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const links = await page.$$eval('a.result__a', (anchors) =>
      anchors.slice(0, k).map((a) => (a as HTMLAnchorElement).href)
    );

    const results: { markdown: string; url: string }[] = [];
    for (const link of links) {
      const p = await browser.newPage();
      try {
        await p.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const content = await p.evaluate(() => document.body.innerText);
        results.push({ markdown: content.slice(0, 25000), url: link });
      } catch (err) {
        console.error('[HEADLESS SEARCH] Failed to fetch', link, err);
      } finally {
        await p.close();
      }
    }
    return results;
  } finally {
    await browser.close();
  }
}
