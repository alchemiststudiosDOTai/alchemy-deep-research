// Persistence utilities for report artefacts (Phase 3 QA Fix Plan)

import { promises as fs } from "fs";
import * as path from "path";
import { createHash } from "crypto";

/**
 * Ensure report/raw and report/cleaned_report directories exist.
 */
export async function ensureReportDirs() {
  const dirs = [
    path.join("report", "raw"),
    path.join("report", "cleaned_report"),
  ];
  for (const dir of dirs) {
    try {
      console.log(`[Persistence] Ensuring directory exists: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
      console.log(`[Persistence] Directory ensured: ${dir}`);
    } catch (e) {
      // Ignore if already exists, else log
      if ((e as any).code !== "EEXIST") {
        console.warn(`[Persistence] Failed to create directory ${dir}:`, e);
      } else {
        console.log(`[Persistence] Directory already exists: ${dir}`);
      }
    }
  }
}

/**
 * Deterministically hash a URL using SHA-256 (hex).
 */
export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

/**
 * Check if file I/O is supported (Node.js only).
 */
export function isFileIOSupported(): boolean {
  // In Node.js, process.versions.node is defined
  return typeof process !== "undefined" && !!process.versions?.node;
}

/**
 * Check if we can write to a directory.
 */
export async function canWriteToDir(dir: string): Promise<boolean> {
  try {
    // Ensure the directory exists before trying to write the test file.
    await fs.mkdir(dir, { recursive: true });

    const testFile = path.join(dir, ".write_test");
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);
    return true;
  } catch (e) {
    // Log only if the error is NOT because the directory doesn't exist (which mkdir should handle)
    // or if it's a permission issue.
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.warn(`[Persistence] Write permission check failed for directory ${dir}:`, e);
    }
    return false;
  }
}

/**
 * Write artefact to file, with error-tolerant logging.
 * @param filePath - Path to write to
 * @param data - String or object (will be JSON-stringified)
 * @param logContext - Context for logging
 */
export async function writeArtefact(
  filePath: string,
  data: string | object,
  logContext: string
): Promise<void> {
  if (!isFileIOSupported()) {
    console.warn(`[Persistence] File I/O not supported. Skipping write for ${logContext}.`);
    return;
  }
  try {
    const dir = path.dirname(filePath);
    if (!(await canWriteToDir(dir))) {
      console.warn(`[Persistence] No write permission for ${dir}. Skipping write for ${logContext}.`);
      return;
    }
    const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, "utf-8");
  } catch (e) {
    console.warn(`[Persistence] Failed to write ${logContext} to ${filePath}:`, e);
  }
}