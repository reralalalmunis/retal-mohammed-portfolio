# CV Identity sample data

`data.js` defines `window.CV_IDENTITY_SEED`, the built-in bilingual profile used by both the interactive website and downloadable CV.

It is JavaScript rather than JSON because this project must open directly through `file://`. Browsers do not reliably allow a directly opened page to fetch local JSON, while local script tags work without a server.

## Schema rules

- Use schema version 2.
- Store every visible string as a localized object: `{ en: "English", ar: "Arabic" }`.
- Store periods as structured `{ start: "YYYY-MM", end: "YYYY-MM" }` values; use `null` for a current role.
- Use stable values such as `live` and `planned` for project status, then localize the displayed label through `ui`.
- Keep unknown project case-study fields as `null` or omit them. Do not invent a problem, solution, role, tools, results, client, metric, or achievement.
- Add a real Arabic translation for each verified English professional fact. Do not use a runtime translation service or silently display English content as an Arabic translation.

## Privacy rules

Never include phone numbers, email addresses, home addresses, national or identification numbers, passwords, API keys, secrets, private CV files, client-private details, or unapproved contact routes.

Only include professional information that has been verified and approved for public display.
