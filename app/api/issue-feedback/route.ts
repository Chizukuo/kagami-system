import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { IssueFeedbackPayload, IssueLayer, IssueVote } from "@/lib/types";
import { KvBinding, sanitizeResId, normalizeProficiencyLevel, verifyResIdSignature } from "@/lib/api-utils";

const VALID_LAYERS: IssueLayer[] = ["grammar", "register", "pragmatics"];
const VALID_VOTES: IssueVote[] = ["agree", "disagree"];
const MAX_ISSUE_INDEX = 50;
const MAX_ISSUE_ORIGINAL_LENGTH = 500;
const MAX_ISSUE_TEXT_LENGTH = 1000;

async function computeIssueHash(issueOriginal: string, issueText: string): Promise<string | undefined> {
  const combined = `${issueOriginal}\n${issueText}`.trim();
  if (!combined) {
    return undefined;
  }

  const bytes = new TextEncoder().encode(combined);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isValidLayer(layer: unknown): layer is IssueLayer {
  return typeof layer === "string" && VALID_LAYERS.includes(layer as IssueLayer);
}

function isValidVote(vote: unknown): vote is IssueVote {
  return typeof vote === "string" && VALID_VOTES.includes(vote as IssueVote);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<IssueFeedbackPayload>;

    if (!body.resId || !isValidLayer(body.layer) || !isValidVote(body.vote)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const issueIndex = Number(body.index);
    if (!Number.isInteger(issueIndex) || issueIndex < 0 || issueIndex >= MAX_ISSUE_INDEX) {
      return NextResponse.json({ error: "Invalid issue index" }, { status: 400 });
    }

    const issueOriginal = typeof body.issueOriginal === "string"
      ? body.issueOriginal.trim().slice(0, MAX_ISSUE_ORIGINAL_LENGTH)
      : "";
    const issueText = typeof body.issueText === "string"
      ? body.issueText.trim().slice(0, MAX_ISSUE_TEXT_LENGTH)
      : "";
    const issueHash = await computeIssueHash(issueOriginal, issueText);

    const { env } = getCloudflareContext();
    const kv = (env as Record<string, unknown>).KAGAMI_EVAL as KvBinding;

    const safeResId = sanitizeResId(body.resId);
    if (!safeResId) {
      return NextResponse.json({ error: "Invalid resId" }, { status: 400 });
    }

    if (!(await verifyResIdSignature(safeResId, body._sig ?? ""))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const key = `issuefb_${safeResId}_${body.layer}_${issueIndex}`;
    const record: IssueFeedbackPayload = {
      resId: safeResId,
      layer: body.layer as IssueLayer,
      index: issueIndex,
      vote: body.vote as IssueVote,
      proficiencyLevel: normalizeProficiencyLevel(body.proficiencyLevel),
      issueHash,
      issueOriginal,
      issueText,
      issueTextLength: issueText.length,
      modelId: typeof body.modelId === "string" ? body.modelId.slice(0, 100).replace(/[^A-Za-z0-9\-._]/g, "") : "unknown",
      sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "unknown",
      timestamp: new Date().toISOString(),
      lang: body.lang,
    };

    await kv.put(key, JSON.stringify(record), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Kagami] Issue feedback error:", error);
    return NextResponse.json({ error: "Failed to store issue feedback" }, { status: 500 });
  }
}
