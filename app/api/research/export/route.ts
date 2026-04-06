import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface KvListKey {
  name: string;
}

interface KvListResult {
  keys: KvListKey[];
  list_complete: boolean;
  cursor?: string;
}

interface KvBinding {
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KvListResult>;
  get(key: string): Promise<string | null>;
}

type Dataset = "all" | "evaluations" | "issue-feedback";
type ExportFormat = "json" | "csv";

function normalizeDataset(value: string | null): Dataset {
  if (value === "evaluations" || value === "issue-feedback" || value === "all") {
    return value;
  }
  return "all";
}

function normalizeFormat(value: string | null): ExportFormat {
  if (value === "csv" || value === "json") {
    return value;
  }
  return "json";
}

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes("\r") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((column) => csvEscape(row[column])).join(","))
    .join("\n");

  return `${header}\n${body}`;
}

async function listRecords(kv: KvBinding, prefix: string): Promise<Array<Record<string, unknown>>> {
  const records: Array<Record<string, unknown>> = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });

    const pageRecords = await Promise.all(
      page.keys.map(async (key) => {
        const raw = await kv.get(key.name);
        if (!raw) {
          return null;
        }

        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          return { ...parsed, _kvKey: key.name };
        } catch {
          return null;
        }
      })
    );

    for (const record of pageRecords) {
      if (record) {
        records.push(record);
      }
    }

    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return records;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dataset = normalizeDataset(searchParams.get("dataset"));
    const format = normalizeFormat(searchParams.get("format"));

    const requiredToken = (process.env.KAGAMI_EXPORT_TOKEN ?? "").trim();
    if (requiredToken) {
      const token = (searchParams.get("token") ?? "").trim();
      if (token !== requiredToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    if (format === "csv" && dataset === "all") {
      return NextResponse.json(
        {
          error: "CSV export requires dataset=evaluations or dataset=issue-feedback",
        },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const kv = (env as Record<string, unknown>).KAGAMI_EVAL as KvBinding;

    const [evaluations, issueFeedback] = await Promise.all([
      dataset === "all" || dataset === "evaluations" ? listRecords(kv, "eval_") : Promise.resolve([]),
      dataset === "all" || dataset === "issue-feedback" ? listRecords(kv, "issuefb_") : Promise.resolve([]),
    ]);

    if (format === "json") {
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        counts: {
          evaluations: evaluations.length,
          issueFeedback: issueFeedback.length,
        },
        evaluations,
        issueFeedback,
      });
    }

    if (dataset === "evaluations") {
      const csv = toCsv(evaluations, [
        "_kvKey",
        "resId",
        "timestamp",
        "lang",
        "proficiencyLevel",
        "inputText",
        "inputScene",
        "grammarCount",
        "registerCount",
        "pragmaticsCount",
        "severityLevel",
        "rating",
        "intentMismatch",
        "userCorrection",
        "feedbackNote",
        "nativeVersion",
        "summary",
      ]);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=eval-export.csv",
        },
      });
    }

    const csv = toCsv(issueFeedback, [
      "_kvKey",
      "resId",
      "layer",
      "index",
      "vote",
      "proficiencyLevel",
      "issueOriginal",
      "issueText",
      "issueHash",
      "timestamp",
      "lang",
    ]);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=issue-feedback-export.csv",
      },
    });
  } catch (error) {
    console.error("[Kagami] Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
