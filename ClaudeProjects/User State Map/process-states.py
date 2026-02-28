#!/usr/bin/env python3
"""
process-states.py

Reads Work/Inbox/user-states.csv and computes three metrics for an
interactive US college destination choropleth map. Outputs a single
JSON object to stdout.

Metrics:
  1. avg_states        — mean count of states each user listed, per home state
  2. want_to_leave_pct — % of users from a state who did NOT include their
                         own home state in their interest list
  3. destination_pop   — % of ALL users (dataset-wide) who included each state
                         in their picks (home-state-independent)

Tooltip data:
  top5_destinations — for each home state, the 5 most frequently picked
                      destination states (with counts)
"""

import csv
import json
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Valid US states / territories
# ---------------------------------------------------------------------------
VALID_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",                        # District of Columbia
    "PR", "VI", "GU", "AS", "MP",  # Territories
}

# ---------------------------------------------------------------------------
# Locate the CSV relative to this script
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent        # Work/References/
VAULT_DIR  = SCRIPT_DIR.parent            # Work/
CSV_PATH   = VAULT_DIR / "Inbox" / "user-states.csv"

# ---------------------------------------------------------------------------
# Load and filter
# ---------------------------------------------------------------------------
def load_rows(csv_path):
    rows = []
    with open(csv_path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            home = row["UserState (All Apps)"].strip()
            soi  = row["StatesOfInterest (All Apps)"].strip()

            # Drop invalid home states
            if home not in VALID_STATES:
                continue

            # Drop No Answer rows
            if soi == "[No Answer]":
                continue

            # Parse bracket list: "[WY CO MT]" → ["WY", "CO", "MT"]
            inner = soi.strip("[]").strip()
            if not inner:
                continue
            destinations = [s for s in inner.split() if s in VALID_STATES]
            if not destinations:
                continue

            rows.append((home, destinations))
    return rows


# ---------------------------------------------------------------------------
# Compute metrics
# ---------------------------------------------------------------------------
def compute_metrics(rows):
    # Group by home state
    by_home = defaultdict(list)   # home_state → list of destination-lists
    for home, dests in rows:
        by_home[home].append(dests)

    total_users = len(rows)

    # Global destination counts (metric 3)
    global_dest_counts = Counter()
    for _, dests in rows:
        global_dest_counts.update(dests)

    # Top source states per destination: for each destination state, which
    # home states most frequently included it in their picks?
    sources_by_dest = defaultdict(Counter)  # dest_state → Counter of home states
    for home, dests in rows:
        for dest in dests:
            sources_by_dest[dest][home] += 1

    per_state = {}
    for state in VALID_STATES:
        users = by_home.get(state, [])
        n = len(users)

        if n == 0:
            per_state[state] = {
                "n": 0,
                "avg_states": None,
                "want_to_leave_pct": None,
                "top5_destinations": [],
            }
            continue

        # Metric 1: avg states per user
        avg_states = sum(len(d) for d in users) / n

        # Metric 2: want to leave (home not in own list)
        want_to_leave = sum(1 for d in users if state not in d)
        want_to_leave_pct = want_to_leave / n * 100

        # Top 5 destinations
        dest_counter = Counter()
        for d in users:
            dest_counter.update(d)
        top5 = [{"state": s, "count": c} for s, c in dest_counter.most_common(5)]

        per_state[state] = {
            "n": n,
            "avg_states": round(avg_states, 2),
            "want_to_leave_pct": round(want_to_leave_pct, 1),
            "top5_destinations": top5,
        }

    # Metric 3: destination popularity (global) + top 5 source states
    destination_pop = {}
    top5_sources = {}
    for state in VALID_STATES:
        count = global_dest_counts.get(state, 0)
        destination_pop[state] = round(count / total_users * 100, 2) if total_users else 0
        src = sources_by_dest.get(state, Counter())
        top5_sources[state] = [{"state": s, "count": c} for s, c in src.most_common(5)]

    return {
        "total_users": total_users,
        "per_state": per_state,
        "destination_pop": destination_pop,
        "top5_sources": top5_sources,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    if not CSV_PATH.exists():
        print(f"ERROR: CSV not found at {CSV_PATH}", file=sys.stderr)
        sys.exit(1)

    rows = load_rows(CSV_PATH)
    print(f"Loaded {len(rows)} valid rows", file=sys.stderr)

    data = compute_metrics(rows)
    print(f"Computed metrics for {len(data['per_state'])} states", file=sys.stderr)
    print(f"Total users (after filtering): {data['total_users']}", file=sys.stderr)

    print(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
