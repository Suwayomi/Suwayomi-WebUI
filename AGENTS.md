## Pull Request Guidelines

When preparing a pull request, follow the existing PR template (`.github/pull_request_template.md`).

- Do not duplicate, rewrite, or modify the checklist defined in the PR template.
- Follow the template as the source of truth.
- Prepare the contribution and provide the information needed for the human to complete the checklist.
- Review your own changes and run relevant tests.
- The human must independently write the PR description.
- Remind the human to complete the PR template checklist personally.

### Human Responsibilities

Some checklist items require personal human judgment and cannot be completed by an AI agent.

- Never check boxes that require personal human confirmation.
- Never claim that the human has reviewed, understood, tested, or approved something on their behalf.
- Never respond to code review feedback as though you were the human.
- Leave all human-confirmation checkboxes unchecked.

**Principle:** The agent assists with implementation and preparation. The human is responsible for personal review, understanding, verification, declarations, and approval.

## Bug Reports

When creating or submitting a bug report:

1. Read `.github/ISSUE_TEMPLATE/bug_report.yml`.
2. Follow its structure and preserve all sections.
3. Do not invent missing information. Explicitly mark unknown or unavailable details.
4. Do not omit sections simply because information is unavailable.
5. Distinguish between confirmed facts, assumptions, and information that still needs human input.
6. Do not fabricate reproduction steps, expected behavior, actual behavior, or environment details.
7. Ask the human for missing information when it is necessary to produce an accurate report.
8. Ensure the final report is consistent with the issue template before submission.

**Principle:** The agent may help investigate and structure a bug report, but must never fabricate information or present assumptions as facts.
