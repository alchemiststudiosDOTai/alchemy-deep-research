# QA Fix Plan for `alchemy-deep-research`

This document outlines a phased plan to address the QA issues identified in [`plans/qa.md`](qa.md) for the `alchemy-deep-research` npm package.

---

## **Phase 1: Packaging & Module Resolution Fixes**

**Goal:** Ensure the package is ESM-compatible, CLI works, and all required files are included.

1. **ESM Configuration**
   - Add `"type": "module"` to [`package.json`](../package.json).
   - Ensure `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` in [`tsconfig.json`](../tsconfig.json).
   - Update the `main`/`exports` fields if needed for ESM-first usage.

2. **Include Prompt Files in Package**
   - Remove `prompts/` from [`.npmignore`](../.npmignore).
   - Add `prompts/` to the `files` array in [`package.json`](../package.json).

3. **CLI Entry Point**
   - If not present, add a `bin` field in [`package.json`](../package.json) for CLI usage.
   - Ensure CLI script (e.g., `run-research.ts`) is ESM-compatible and documented.

---

## **Phase 2: Robust Error Handling & Reporting**

**Goal:** Make failures visible, always generate a report, and log missing prompt issues.

1. **Prompt Loading**
   - In [`src/BrowserUseClient.ts`](../src/BrowserUseClient.ts), keep the current fallback to a default prompt if `prompts/browser-use.md` is missing.
   - Log a clear warning when the custom prompt is missing.

2. **Extraction Failure Reporting**
   - Ensure that if extraction fails for a URL, this is explicitly noted in the output report for that URL.
   - Always generate a report, even if some steps fail.

---
## **Phase 3: Report Directory & Data Persistence**

**Goal:** Persist both *raw* and *cleaned* extraction artefacts—Markdown/HTML **and** JSON—inside a unified `report/` directory so they can be inspected or re‑processed later.

---

### 1. Directory Structure

```
report/
├── raw/              # Unprocessed HTML/Markdown + JSON
└── cleaned_report/   # Post‑processed, cleaned HTML/Markdown + JSON
```

*Create the directories if they do not already exist.*

---

### 2. Raw Data Saving

* **When:** Immediately after each extraction attempt (success **or** failure).
* **What:**

  * Raw HTML/Markdown → `report/raw/[url_hash].md`
  * Raw structured data (if available) → `report/raw/[url_hash].json`
* **Naming:** Use a deterministic hash (e.g. SHA‑256) of the canonical URL as the basename.
* **Fallback:** If the runtime environment does **not** support file I/O (e.g. browser, certain serverless functions), skip gracefully and emit a log warning.

---

### 3. Cleaned Data Saving

* **When:** After the cleaning/normalisation pipeline succeeds.
* **What:**

  * Cleaned/normalised Markdown → `report/cleaned_report/[url_hash].md`
  * Cleaned/normalised JSON (if produced) → `report/cleaned_report/[url_hash].json`
* **Naming:** Same `[url_hash]` convention as in *Raw Data Saving* to keep pairs easily correlated.

---

### 4. Error‑Tolerance & Logging

* **Writable Check:** Verify write permissions before attempting to persist files.
* **Graceful Degradation:** If writes fail, record the failure reason in application logs but allow the extraction workflow to continue.

---



## **Phase 4: Documentation & Testing**

**Goal:** Ensure users and maintainers understand the changes and that all fixes are verified.

1. **Update Documentation**
   - Document the new raw data persistence behavior and CLI usage in [`README.md`](../README.md).
   - Note ESM requirements and any breaking changes.

2. **Add/Update Tests**
   - Add tests to verify:
     - Prompt fallback works and logs warnings.
     - Extraction failures are reported.
     - Raw data files are created as expected.

---

## **Mermaid Diagram: QA Fixes Flow**

```mermaid
flowchart TD
    A[Start Extraction] --> B{Load Prompt}
    B -- Success --> C[Use Custom Prompt]
    B -- Fail --> D[Use Default Prompt & Log Warning]
    C & D --> E[Run Extraction]
    E --> F{Extraction Success?}
    F -- Yes --> G[Save Raw Data to raw/[url_hash].md]
    F -- No --> H[Note Failure in Report]
    H --> G
    G --> I{File Writing Supported?}
    I -- Yes --> J[Write File]
    I -- No --> K[Skip File Writing]
    J & K --> L[Generate/Update Report]
    L --> M[End]
```

---

## **Summary Table**

| Phase | Area                        | Key Actions                                                                 |
|-------|-----------------------------|-----------------------------------------------------------------------------|
| 1     | Packaging/Module Resolution | ESM config, include prompts, CLI entry point                                |
| 2     | Error Handling/Reporting    | Prompt fallback, extraction failure reporting, always generate report        |
| 3     | Raw Data Persistence        | Save raw data for every extraction, use `raw/` dir, skip in unsupported env |
| 4     | Docs & Testing              | Update docs, add tests for new behaviors                                    |