#!/usr/bin/env python3
"""
Kagami research analysis script.

Usage example:
  python scripts/analyze_layer_disagreement.py \
    --eval-csv data/eval-export.csv \
    --issue-csv data/issue-feedback-export.csv \
    --output-dir data/analysis
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

RATING_ORDER = ["inaccurate", "partial", "accurate"]
RATING_TO_INDEX = {rating: idx for idx, rating in enumerate(RATING_ORDER)}


def read_csv_rows(path: Path) -> List[Dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as fp:
        return list(csv.DictReader(fp))


def write_csv(path: Path, fieldnames: List[str], rows: Iterable[Dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def parse_int(value: str, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def parse_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def derive_system_rating(grammar_count: int, register_count: int, pragmatics_count: int) -> str:
    total = grammar_count + register_count + pragmatics_count
    if total == 0:
        return "accurate"
    if total <= 2:
        return "partial"
    return "inaccurate"


def safe_div(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return numerator / denominator


def safe_odds(successes: int, total: int) -> float:
    failures = total - successes
    if failures <= 0:
        return float("inf") if successes > 0 else 0.0
    return successes / failures


def weighted_kappa(human: List[str], system: List[str]) -> float:
    valid_pairs = [
        (RATING_TO_INDEX[h], RATING_TO_INDEX[s])
        for h, s in zip(human, system)
        if h in RATING_TO_INDEX and s in RATING_TO_INDEX
    ]
    n = len(valid_pairs)
    if n == 0:
        return float("nan")

    k = len(RATING_ORDER)
    obs = [[0.0 for _ in range(k)] for _ in range(k)]

    for h_idx, s_idx in valid_pairs:
        obs[h_idx][s_idx] += 1.0

    for i in range(k):
        for j in range(k):
            obs[i][j] /= n

    human_marginals = [sum(obs[i][j] for j in range(k)) for i in range(k)]
    system_marginals = [sum(obs[i][j] for i in range(k)) for j in range(k)]

    exp = [[human_marginals[i] * system_marginals[j] for j in range(k)] for i in range(k)]

    def disagreement_weight(i: int, j: int) -> float:
        return ((i - j) ** 2) / ((k - 1) ** 2)

    observed_disagreement = 0.0
    expected_disagreement = 0.0

    for i in range(k):
        for j in range(k):
            w = disagreement_weight(i, j)
            observed_disagreement += w * obs[i][j]
            expected_disagreement += w * exp[i][j]

    if expected_disagreement == 0:
        return 1.0

    return 1.0 - (observed_disagreement / expected_disagreement)


def analyze_eval_distribution(eval_rows: List[Dict[str, str]]) -> List[Dict[str, object]]:
    grouped: Dict[Tuple[int, int, int], Counter] = defaultdict(Counter)

    for row in eval_rows:
        grammar_count = parse_int(row.get("grammarCount", "0"))
        register_count = parse_int(row.get("registerCount", "0"))
        pragmatics_count = parse_int(row.get("pragmaticsCount", "0"))
        rating = row.get("rating", "")
        grouped[(grammar_count, register_count, pragmatics_count)][rating] += 1

    output_rows: List[Dict[str, object]] = []
    for (grammar_count, register_count, pragmatics_count), counts in sorted(grouped.items()):
        n = sum(counts.values())
        inaccurate = counts.get("inaccurate", 0)
        output_rows.append(
            {
                "grammarCount": grammar_count,
                "registerCount": register_count,
                "pragmaticsCount": pragmatics_count,
                "total": n,
                "accurate": counts.get("accurate", 0),
                "partial": counts.get("partial", 0),
                "inaccurate": inaccurate,
                "inaccurateRate": round(safe_div(inaccurate, n), 4),
            }
        )

    return output_rows


def analyze_h1(eval_rows: List[Dict[str, str]]) -> Dict[str, object]:
    target_total = 0
    target_inaccurate = 0
    baseline_total = 0
    baseline_inaccurate = 0

    for row in eval_rows:
        grammar_count = parse_int(row.get("grammarCount", "0"))
        pragmatics_count = parse_int(row.get("pragmaticsCount", "0"))
        rating = row.get("rating", "")

        in_target = grammar_count == 0 and pragmatics_count >= 2
        is_inaccurate = rating == "inaccurate"

        if in_target:
            target_total += 1
            if is_inaccurate:
                target_inaccurate += 1
        else:
            baseline_total += 1
            if is_inaccurate:
                baseline_inaccurate += 1

    target_rate = safe_div(target_inaccurate, target_total)
    baseline_rate = safe_div(baseline_inaccurate, baseline_total)
    if baseline_rate == 0:
        risk_ratio = float("inf") if target_rate > 0 else 0.0
    else:
        risk_ratio = target_rate / baseline_rate

    target_odds = safe_odds(target_inaccurate, target_total)
    baseline_odds = safe_odds(baseline_inaccurate, baseline_total)

    if baseline_odds == 0:
        odds_ratio = float("inf") if target_odds > 0 else 0.0
    elif math.isinf(target_odds):
        odds_ratio = float("inf")
    else:
        odds_ratio = target_odds / baseline_odds

    return {
        "targetCondition": "grammarCount==0 && pragmaticsCount>=2",
        "targetTotal": target_total,
        "targetInaccurate": target_inaccurate,
        "targetInaccurateRate": round(target_rate, 4),
        "baselineTotal": baseline_total,
        "baselineInaccurate": baseline_inaccurate,
        "baselineInaccurateRate": round(baseline_rate, 4),
        "riskRatio": round(risk_ratio, 4) if math.isfinite(risk_ratio) else risk_ratio,
        "oddsRatio": round(odds_ratio, 4) if math.isfinite(odds_ratio) else odds_ratio,
    }


def analyze_intent_mismatch(eval_rows: List[Dict[str, str]]) -> List[Dict[str, object]]:
    crosstab: Dict[str, Counter] = defaultdict(Counter)

    for row in eval_rows:
        pragmatics_count = parse_int(row.get("pragmaticsCount", "0"))
        if pragmatics_count == 0:
            bucket = "0"
        elif pragmatics_count == 1:
            bucket = "1"
        else:
            bucket = "2+"

        mismatch = parse_bool(row.get("intentMismatch", "false"))
        crosstab[bucket]["mismatch_true" if mismatch else "mismatch_false"] += 1

    output_rows: List[Dict[str, object]] = []
    for bucket in ["0", "1", "2+"]:
        counts = crosstab.get(bucket, Counter())
        total = counts.get("mismatch_true", 0) + counts.get("mismatch_false", 0)
        mismatch_true = counts.get("mismatch_true", 0)
        output_rows.append(
            {
                "pragmaticsBucket": bucket,
                "total": total,
                "intentMismatchTrue": mismatch_true,
                "intentMismatchFalse": counts.get("mismatch_false", 0),
                "intentMismatchRate": round(safe_div(mismatch_true, total), 4),
            }
        )

    return output_rows


def analyze_issue_precision(issue_rows: List[Dict[str, str]]) -> List[Dict[str, object]]:
    layer_counts: Dict[str, Counter] = defaultdict(Counter)

    for row in issue_rows:
        layer = row.get("layer", "unknown")
        vote = row.get("vote", "")
        if vote in {"agree", "disagree"}:
            layer_counts[layer][vote] += 1

    output_rows: List[Dict[str, object]] = []
    for layer in ["grammar", "register", "pragmatics"]:
        counts = layer_counts.get(layer, Counter())
        agree = counts.get("agree", 0)
        disagree = counts.get("disagree", 0)
        total = agree + disagree
        output_rows.append(
            {
                "layer": layer,
                "agree": agree,
                "disagree": disagree,
                "total": total,
                "precision": round(safe_div(agree, total), 4),
            }
        )

    return output_rows


def build_kappa_payload(eval_rows: List[Dict[str, str]], use_derived_system_rating: bool) -> Dict[str, object]:
    human_ratings: List[str] = []
    system_ratings: List[str] = []

    for row in eval_rows:
        human = row.get("rating", "")
        if human not in RATING_TO_INDEX:
            continue

        system = row.get("systemRating", "")
        if system not in RATING_TO_INDEX and use_derived_system_rating:
            grammar_count = parse_int(row.get("grammarCount", "0"))
            register_count = parse_int(row.get("registerCount", "0"))
            pragmatics_count = parse_int(row.get("pragmaticsCount", "0"))
            system = derive_system_rating(grammar_count, register_count, pragmatics_count)

        if system not in RATING_TO_INDEX:
            continue

        human_ratings.append(human)
        system_ratings.append(system)

    kappa_value = weighted_kappa(human_ratings, system_ratings)

    return {
        "pairs": len(human_ratings),
        "weightedKappa": None if math.isnan(kappa_value) else round(kappa_value, 6),
        "ratingOrder": RATING_ORDER,
    }


def classify_layer_condition(grammar_count: int, register_count: int, pragmatics_count: int) -> str:
    active_layers = sum(
        [
            1 if grammar_count > 0 else 0,
            1 if register_count > 0 else 0,
            1 if pragmatics_count > 0 else 0,
        ]
    )

    if active_layers == 0:
        return "no_issue"
    if active_layers > 1:
        return "mixed"
    if grammar_count > 0:
        return "grammar_only"
    if register_count > 0:
        return "register_only"
    return "pragmatics_only"


def analyze_layer_conditioned_kappa(
    eval_rows: List[Dict[str, str]],
    use_derived_system_rating: bool,
) -> List[Dict[str, object]]:
    grouped_human: Dict[str, List[str]] = defaultdict(list)
    grouped_system: Dict[str, List[str]] = defaultdict(list)

    for row in eval_rows:
        human = row.get("rating", "")
        if human not in RATING_TO_INDEX:
            continue

        grammar_count = parse_int(row.get("grammarCount", "0"))
        register_count = parse_int(row.get("registerCount", "0"))
        pragmatics_count = parse_int(row.get("pragmaticsCount", "0"))

        system = row.get("systemRating", "")
        if system not in RATING_TO_INDEX and use_derived_system_rating:
            system = derive_system_rating(grammar_count, register_count, pragmatics_count)
        if system not in RATING_TO_INDEX:
            continue

        group = classify_layer_condition(grammar_count, register_count, pragmatics_count)
        grouped_human[group].append(human)
        grouped_system[group].append(system)

    output_rows: List[Dict[str, object]] = []
    for group in ["no_issue", "grammar_only", "register_only", "pragmatics_only", "mixed"]:
        human_ratings = grouped_human.get(group, [])
        system_ratings = grouped_system.get(group, [])
        kappa_value = weighted_kappa(human_ratings, system_ratings)
        output_rows.append(
            {
                "group": group,
                "pairs": len(human_ratings),
                "weightedKappa": None if math.isnan(kappa_value) else round(kappa_value, 6),
            }
        )

    return output_rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze Kagami layer-wise disagreement and feedback data")
    parser.add_argument("--eval-csv", required=True, type=Path, help="Path to eval-export.csv")
    parser.add_argument("--issue-csv", type=Path, help="Path to issue-feedback-export.csv")
    parser.add_argument("--output-dir", type=Path, default=Path("analysis-output"), help="Directory for analysis outputs")
    parser.add_argument(
      "--use-derived-system-rating",
      action="store_true",
      help="Derive systemRating from counts when systemRating column is missing",
    )
    args = parser.parse_args()

    eval_rows = read_csv_rows(args.eval_csv)
    issue_rows = read_csv_rows(args.issue_csv) if args.issue_csv else []

    args.output_dir.mkdir(parents=True, exist_ok=True)

    grouped_distribution = analyze_eval_distribution(eval_rows)
    write_csv(
        args.output_dir / "grouped_rating_distribution.csv",
        [
            "grammarCount",
            "registerCount",
            "pragmaticsCount",
            "total",
            "accurate",
            "partial",
            "inaccurate",
            "inaccurateRate",
        ],
        grouped_distribution,
    )

    h1_summary = analyze_h1(eval_rows)
    write_csv(
        args.output_dir / "hypothesis_h1_summary.csv",
        list(h1_summary.keys()),
        [h1_summary],
    )

    mismatch_crosstab = analyze_intent_mismatch(eval_rows)
    write_csv(
        args.output_dir / "intent_mismatch_pragmatics_crosstab.csv",
        [
            "pragmaticsBucket",
            "total",
            "intentMismatchTrue",
            "intentMismatchFalse",
            "intentMismatchRate",
        ],
        mismatch_crosstab,
    )

    if issue_rows:
        layer_precision = analyze_issue_precision(issue_rows)
        write_csv(
            args.output_dir / "layer_issue_precision.csv",
            ["layer", "agree", "disagree", "total", "precision"],
            layer_precision,
        )

    kappa_payload = build_kappa_payload(eval_rows, args.use_derived_system_rating)
    with (args.output_dir / "weighted_kappa.json").open("w", encoding="utf-8") as fp:
        json.dump(kappa_payload, fp, ensure_ascii=False, indent=2)

    layer_conditioned_kappa = analyze_layer_conditioned_kappa(eval_rows, args.use_derived_system_rating)
    write_csv(
        args.output_dir / "layer_conditioned_kappa.csv",
        ["group", "pairs", "weightedKappa"],
        layer_conditioned_kappa,
    )

    print("Analysis finished.")
    print(f"Output directory: {args.output_dir}")
    print(f"- grouped_rating_distribution.csv ({len(grouped_distribution)} rows)")
    print("- hypothesis_h1_summary.csv (1 row)")
    print(f"- intent_mismatch_pragmatics_crosstab.csv ({len(mismatch_crosstab)} rows)")
    if issue_rows:
        print("- layer_issue_precision.csv")
    print("- weighted_kappa.json")
    print("- layer_conditioned_kappa.csv")


if __name__ == "__main__":
    main()
