import * as dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Generate a clean, human-friendly research report from all findings and URLs.
 * Removes the word "learning" and produces a markdown report with sources.
 */
export async function generateReport(
  topic: string,
  allFindings: string[],
  allSources: string[],
  model = "gpt-4o-mini"
): Promise<string> {
  // Compose the context for the LLM
  const user = `You are a world-class research summarizer. Given the following research topic, findings, and source URLs, create a clear, concise, and well-structured markdown report.\n\n` +
    `# Topic\n${topic}\n\n` +
    `# Findings\n` +
    allFindings.map((f, i) => `Finding ${i + 1}: ${f}`).join("\n\n") +
    `\n\n# Sources\n` +
    allSources.map((url, i) => `${i + 1}. ${url}`).join("\n");

  const system = `You are an expert technical writer.\n\n- Write a report called REPORT.\n- Integrate all findings and sources into a single, readable markdown report.\n- The report should be useful for a smart, non-expert audience.\n- Include the URLs as references at the end.\n- Use headings, bullet points, and clear structure.\n- Make it look professional, like something you'd share with a team.\n`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    max_tokens: 1500,
    temperature: 0.4,
  });

  // Extract and return the markdown report
  return response.choices[0].message.content?.trim() || "";
}
