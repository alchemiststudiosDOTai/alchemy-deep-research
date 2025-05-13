import axios from "axios";
import { URL } from "url";
import * as path from "path";

export interface BrowserUseOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class BrowserUseClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(opts: BrowserUseOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.BROWSER_USE_API_KEY ?? "";
    if (!this.apiKey) throw new Error("Missing BROWSER_USE_API_KEY");
    this.baseUrl = opts.baseUrl ?? "https://api.browser-use.com/api/v1";
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /** POST /run-task – returns task id */
  async runTask(
    task: string,
    llmModel: string,
    options: {
      save_browser_data?: boolean;
      structured_output_json?: string;
      use_adblock?: boolean;
      use_proxy?: boolean;
    } = {}
  ) {
    const body = {
      task,
      llm_model: llmModel,
      ...options,
    };
    console.log('[BROWSER-USE] Request body:', JSON.stringify(body, null, 2));
    const { data } = await axios.post<{ id: string }>(
      `${this.baseUrl}/run-task`,
      body,
      { headers: this.headers() }
    );
    return data.id;
  }

  /** GET /task/{id}/status – returns "queued" | "running" | "finished" | … */
  async getStatus(id: string) {
    const { data } = await axios.get<string>(
      `${this.baseUrl}/task/${id}/status`,
      { headers: this.headers() }
    );
    return data;
  }

  /** GET /task/{id} – returns full task payload incl. `output` */
  async getResult(id: string) {
    const { data } = await axios.get<{ output?: unknown }>(
      `${this.baseUrl}/task/${id}`,
      { headers: this.headers() }
    );
    return data.output;
  }

  /** Fire-and-forget wrapper that blocks until “finished” or failure */
  async renderAndExtract(
    url: string,
    llmModel = "gpt-4.1-mini",
    pollMs = 5_000,
    options: {
      save_browser_data?: boolean;
      structured_output_json?: string;
      use_adblock?: boolean;
      use_proxy?: boolean;
    } = {}
  ): Promise<string | undefined> {
    let task: string;
    const fs = await import('fs/promises');
    try {
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const promptPath = path.join(currentDir, '..', 'prompts', 'browser-use.md');
      const promptTemplate = await fs.readFile(promptPath, 'utf8');
      // Use everything up to the first code block or end of file
      const promptBody = promptTemplate.split('```')[0].trim();
      task = promptBody.replace(/\{\{URL\}\}|\{url\}/gi, url);
      console.log(`[BROWSER-USE] Using prompt from prompts/browser-use.md`);
    } catch (e) {
      task = `Go to ${url}. Extract the primary textual content as markdown.`;
      console.warn('[BROWSER-USE] WARNING: Custom prompt "prompts/browser-use.md" missing. Using default prompt.', e);
    }
    console.log(`[BROWSER-USE] Using model: ${llmModel} for extraction on: ${url}`);
    const id = await this.runTask(task, llmModel, options);
    console.log(`[BROWSER-USE] Task ID: ${id}`);

    while (true) {
      const status = await this.getStatus(id);
      if (status === "finished") break;
      if (["failed", "stopped"].includes(status)) return;
      await new Promise((r) => setTimeout(r, pollMs));
    }
    const output = await this.getResult(id);

    // Fetch and log the full BrowserUse task result (all metadata)
    try {
      const axios = (await import('axios')).default;
      const { data: taskMeta } = await axios.get(
        `${this.baseUrl}/task/${id}`,
        { headers: this.headers() }
      );
      console.log(`[BROWSER-USE] Full task result for ${id}:`, JSON.stringify(taskMeta, null, 2));
    } catch (err) {
      console.warn(`[BROWSER-USE] Could not fetch full task result for ${id}:`, err);
    }

    return typeof output === "string"
      ? output
      : (output as any)?.markdown_content;
  }
}
