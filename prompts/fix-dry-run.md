You are an autonomous coding agent.

Inputs:
- ESLint JSON report at /tmp/lint.json

Task:
1. Parse the ESLint issues.
2. Select up to 3 trivial, high-confidence fixes (unused vars, missing semicolons, simple formatting).
3. Do NOT change business logic.
4. Do NOT modify files directly.
5. Produce a unified diff patch at /tmp/proposed_patch.diff showing the fixes.
6. Output a short summary explaining what would be fixed.

Constraints:
- If fixes are not trivial, explain why and still output a patch if possible.
- Keep changes minimal.

Output:
- Write patch to /tmp/proposed_patch.diff
- Print a concise summary to stdout.
