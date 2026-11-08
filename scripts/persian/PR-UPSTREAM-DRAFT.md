# Upstream PR draft (not submitted)

**Suggested title:** `fix(markdown): preserve Persian/Arabic bidi without reversing LTR code and links`

## Summary

- Give paragraphs, headings, list items and table cells `dir="auto"` while keeping nested code blocks unchanged.
- Isolate inline code as LTR and links as automatic direction without altering their URL or text.
- Keep streamed raw message text independent from the interface language.
- Include SSR/DOM/streaming/input tests to cover mixed English/Persian content, links and code.

## Scope

Upstream PR must include only portable renderer changes and their tests, such as:

- `src/renderer/components/markdown-content-direction.ts`
- `src/renderer/components/Markdown.tsx` + SSR/DOM tests
- `src/renderer/components/StreamingTextFade.tsx` + test
- `src/renderer/components/InputBox/MessageInputField.tsx` + test
- `src/renderer/utils/rtl.ts` where relevant

**Do NOT include** `electron-builder.persian.cjs`, the private update feed, personal app identity, custom GitHub workflows, or the personal installer configuration. These belong in the fork only.

## Testing

The four dependency-free source checks passed in the preparation environment. Vitest, TypeScript check, Windows installer and visual Electron smoke test have **not** been run here and must not be marked as passed. Fill in CI results from the fork before submitting.

## Related upstream work

- Existing open PR: https://github.com/chatboxai/chatbox/pull/3865
- Related issue: https://github.com/chatboxai/chatbox/issues/3849

Review #3865 first and coordinate rather than duplicate it. This draft is **not a GitHub PR**; no push or submission was performed.

## Suggested GitHub CLI command (after pushing an appropriate FORK branch)

```bash
gh pr create --repo chatboxai/chatbox --base main --head YOUR_USER:chatbox/persian-content-direction --title "fix(markdown): isolate Persian/Arabic content direction" --body-file scripts/persian/PR-UPSTREAM-DRAFT.md
```

Use only if the source branch really contains the desired changes and actual test results are documented. The fork owner and GitHub credentials are still unknown.
