---
name: oh-review
description: Review a PR against its linked issue requirements, post structured feedback
---

# oh-review

Review a PR, check it against the linked issue's requirements, and post structured feedback as a GitHub review. Read-only except for the review comment itself — no code changes, no commits.

## Invocation

`/oh-review <pr-number>`

- `<pr-number>` - the pull request number to review

## Prerequisites

- **Repo context**: Run from the repo root where the PR exists
- **GitHub CLI**: `gh` must be authenticated

## Flow

1. Read dive context (if available) for project background:
   ```bash
   cat .wm/dive_context.md 2>/dev/null || echo "No dive context"
   ```

2. Fetch PR metadata:
   ```bash
   gh pr view <pr-number> --json title,body,headRefName,baseRefName,additions,deletions,changedFiles,state,mergeable
   ```
   Abort if PR is not open.

3. **Read the linked issue (CRITICAL)** — the issue is the source of truth for requirements:
   - Parse "Closes #N" / "Fixes #N" / "Resolves #N" from PR body
   - Fetch the full issue: `gh issue view <N> --json title,body`
   - Extract acceptance criteria, goal, context, constraints
   - If no linked issue found, note "No linked issue — cannot verify requirements" and review code quality only

4. Fetch the PR diff:
   ```bash
   gh pr diff <pr-number>
   ```

5. Review the diff against:
   - **The linked issue requirements first** — are acceptance criteria met? Does the implementation match the goal? Are constraints respected?
   - Code quality (bugs, missing error handling, edge cases)
   - Consistency with existing patterns in the repo
   - Missing tests or documentation

6. Write a structured review to a temp file:
   ```markdown
   ## Review: PR #<number> — <title>

   ### Requirements Check (from #<issue>)
   - [ ] <acceptance criterion 1> — met/not met/partially met
   - [ ] <acceptance criterion 2> — met/not met/partially met

   ### Blockers (P0-P1)
   - <issue with explanation and suggested fix>

   ### Improvements (P2-P3)
   - <issue with explanation>

   ### Clean
   - <what looks good>

   ### Follow-up Work
   - <concrete items that should be separate issues/PRs>
   ```

7. Post the review on the PR:
   - If blockers found or requirements not met:
     ```bash
     gh pr review <pr-number> --request-changes --body-file /tmp/review-<pr-number>.md
     ```
   - If no blockers and requirements met:
     ```bash
     gh pr review <pr-number> --approve --body-file /tmp/review-<pr-number>.md
     ```

8. Signal completion:
   - Success with blockers: `signal_completion(status: "blocked", blocker: "PR has N blockers — see review comment")`
   - Success clean: `signal_completion(status: "success", message: "Approved — N improvements noted")`
   - Error: `signal_completion(status: "error", error: "<reason>")`

## Review Principles

- **The issue is the spec.** The review must check the PR against the issue requirements, not just review code in isolation. A PR that passes code review but misses requirements is a failure.
- Be opinionated but structured — blockers vs improvements vs nits
- Read the full diff, not just file names — actually understand the changes
- Follow-up items should be concrete enough to become issues (not vague "consider refactoring")
- Do NOT auto-create follow-up issues — just post them as review comments. The human decides what to act on.
- Keep the skill read-only except for the review comment itself — no code changes, no commits

## Exit Conditions

- **Success**: Review posted, PR approved (no blockers)
- **Blocked**: Review posted with request-changes (has blockers)
- **Error**: Could not fetch PR, diff, or post review

## Completion Signaling (MANDATORY)

**CRITICAL: You MUST signal completion when done.** Call the `signal_completion` tool as your FINAL action.

**Signal based on outcome:**

| Outcome | Call |
|---------|------|
| Review posted, PR approved | `signal_completion(status: "success", message: "Approved — N improvements noted")` |
| Review posted, changes requested | `signal_completion(status: "blocked", blocker: "PR has N blockers — see review comment")` |
| Unrecoverable failure | `signal_completion(status: "error", error: "<reason>")` |

**If you do not signal, the orchestrator will not know you are done and the session becomes orphaned.**

**Fallback:** If the `signal_completion` tool is not available, output your completion status as your final message in the format: `COMPLETION: status=<status> message=<msg>` or `COMPLETION: status=<status> error=<reason>`.

## Example

```
$ /oh-review 99

Fetching PR #99...
PR: "Fix validation bug in auth module"
State: open, +147 -23, 4 files changed

Parsing linked issue...
Found: Closes #42

Fetching issue #42...
Issue: "Fix validation bug in auth module"
Acceptance criteria:
  1. Empty string validation returns error
  2. Tests cover edge cases
  3. No changes to public API

Fetching PR diff...
Reviewing diff against requirements...

Posting review...
gh pr review 99 --approve --body-file /tmp/review.md

Review posted:
  Requirements: 3/3 met
  Blockers: 0
  Improvements: 2
  Follow-ups: 1

signal_completion(status: "success", message: "Approved — 2 improvements noted")
Done.
```

ARGUMENTS: 
