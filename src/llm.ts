import * as dotenv from "dotenv";
dotenv.config();
import { z } from "zod";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** Schema helpers via Zod */
export const SearchQuery = z.object({
  query: z.string(),
  research_goal: z.string(),
});
export const SearchBatch = z.object({ queries: z.array(SearchQuery) });
export type SearchQueryT = z.infer<typeof SearchQuery>;

export async function generateQueries(
  topic: string,
  prev: string[],
  n = 3,
  model = "gpt-4o-mini"
): Promise<SearchQueryT[]> {
  const system =
    "You generate focused search queries given a topic and prior learnings. Respond in JSON format as an object: { queries: [{ query: string, research_goal: string }, ...] }";
  const user = `Topic: ${topic}\nPrevious findings:\n${prev.join(
    "\n"
  )}\nGenerate ${n} queries + research_goal`;
  const response = await openai.responses.parse({
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: zodTextFormat(SearchBatch, "batch"),
    },
  });
  return response.output_parsed?.queries || [];
}

export const SearchDigest = z.object({
  learnings: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
});
export type SearchDigestT = z.infer<typeof SearchDigest>;

export async function digest(
  query: string,
  snippets: string[],
  model = "gpt-4o-mini"
): Promise<SearchDigestT> {
  const system =
    "You are a research analyst. Extract up to 2 key learnings and 2 follow-up questions. Respond in JSON format as an object: { learnings: string[], follow_up_questions: string[] }";
  const joined = snippets.map((s) => `<content>${s}</content>`).join("\n");
  const user = `Query: ${query}\n${joined}`;
  const response = await openai.responses.parse({
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: zodTextFormat(SearchDigest, "result"),
    },
  });
  return response.output_parsed || { learnings: [], follow_up_questions: [] };
}
